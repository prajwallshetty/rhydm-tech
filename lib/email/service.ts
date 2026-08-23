import "server-only";

import { db } from "@/lib/db";
import { EmailStatus, EmailType } from "@/lib/generated/prisma/enums";
import {
  EmailPermanentError,
  EmailTransientError,
  sendRawMessage,
} from "@/lib/email/gmail";
import { EmailAuthError, EmailConfigError, inspectGmailConfig } from "@/lib/email/oauth";
import { emailUrl } from "@/lib/email/layout";
import {
  renderAdminNotification,
  renderContactAcknowledgement,
  renderContactNotification,
  renderExchangeAdminNotification,
  renderExchangeReceived,
  renderOrderConfirmation,
  renderPasswordReset,
  renderTestEmail,
  type OrderEmailInput,
  type RenderedEmail,
} from "@/lib/email/templates/transactional";
import {
  renderMarketingEmail,
  type MarketingEmailInput,
} from "@/lib/email/templates/marketing";

/**
 * The one way this application sends email.
 *
 * Nothing else may call the Gmail transport directly. Routing every message
 * through here is what guarantees a consistent From address, an audit row for
 * every attempt, and uniform handling of the "mailbox not connected" case.
 */

export interface SendResult {
  ok: boolean;
  /** Present on success. Gmail's message id, useful for tracing. */
  messageId?: string | null;
  error?: string;
  /** True when retrying could plausibly succeed (network, 429, 5xx). */
  retryable?: boolean;
  /** True when the send was skipped because it had already happened. */
  skipped?: boolean;
}

interface DispatchOptions {
  to: string;
  type: EmailType;
  /**
   * Either the rendered message or a thunk that produces it.
   *
   * Rendering can itself fail — `emailOrigin()` refuses to build links against
   * a localhost origin in production, for instance. Accepting a thunk lets
   * dispatch run the render inside its own error handling, so a template
   * failure is recorded in EmailLog like any other, instead of escaping as an
   * unhandled rejection with no trace of which message was lost.
   */
  rendered: RenderedEmail | ((logoUrl: string | null) => RenderedEmail);
  replyTo?: string;
  listUnsubscribeUrl?: string;
  userId?: string | null;
  orderId?: string | null;
  campaignId?: string | null;
}

/** Resolves a thunk, or passes an already-rendered message straight through. */
function resolveRendered(
  rendered: DispatchOptions["rendered"],
  logoUrl: string | null
): RenderedEmail {
  return typeof rendered === "function" ? rendered(logoUrl) : rendered;
}

/** Is the mailbox connected? No network call; may read the credential store. */
export async function isEmailConfigured(): Promise<boolean> {
  return (await inspectGmailConfig()).configured;
}

/**
 * Sends one message and records the attempt.
 *
 * A logging failure must never lose a delivered message, so the log write is
 * best-effort and its own errors are swallowed after being reported.
 */
async function dispatch(options: DispatchOptions): Promise<SendResult> {
  const { to, type } = options;

  let logoUrl: string | null = null;
  try {
    const { getGlobalLogoUrl } = await import("@/components/brand/logo-source");
    logoUrl = await getGlobalLogoUrl();
  } catch (err) {
    // ignore
  }

  let rendered: RenderedEmail;
  try {
    rendered = resolveRendered(options.rendered, logoUrl);
  } catch (err) {
    // A misconfigured origin or a broken template. Not retryable: it will fail
    // identically until someone fixes the configuration.
    const message = err instanceof Error ? err.message : "Template rendering failed";
    console.error(`[email] ${type} to ${to} could not be rendered:`, message);
    await db.emailLog
      .create({
        data: {
          recipient: to,
          type,
          subject: "(render failed)",
          status: EmailStatus.FAILED,
          error: message,
          userId: options.userId ?? null,
          orderId: options.orderId ?? null,
          campaignId: options.campaignId ?? null,
        },
      })
      .catch(() => undefined);
    return { ok: false, error: message, retryable: false };
  }

  let logId: string | null = null;
  try {
    const log = await db.emailLog.create({
      data: {
        recipient: to,
        type,
        subject: rendered.subject,
        status: EmailStatus.QUEUED,
        attempts: 1,
        userId: options.userId ?? null,
        orderId: options.orderId ?? null,
        campaignId: options.campaignId ?? null,
      },
      select: { id: true },
    });
    logId = log.id;
  } catch (err) {
    console.error("[email] could not write EmailLog row:", err);
  }

  try {
    const { messageId } = await sendRawMessage({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      replyTo: options.replyTo,
      listUnsubscribeUrl: options.listUnsubscribeUrl,
    });

    if (logId) {
      await db.emailLog
        .update({
          where: { id: logId },
          data: { status: EmailStatus.SENT, sentAt: new Date(), messageId },
        })
        .catch((err: unknown) => console.error("[email] log update failed:", err));
    }

    console.log(`[GMAIL_SEND] Email send successful to ${to} (${type})`);
    return { ok: true, messageId };
  } catch (err) {
    const retryable = err instanceof EmailTransientError;
    // A permanently bad address is recorded distinctly so a retry sweep can
    // skip it forever instead of hammering an address that cannot receive.
    const status =
      err instanceof EmailPermanentError ? EmailStatus.BOUNCED : EmailStatus.FAILED;
    const message = err instanceof Error ? err.message : "Unknown email failure";

    if (logId) {
      await db.emailLog
        .update({ where: { id: logId }, data: { status, error: message } })
        .catch((logErr: unknown) => console.error("[email] log update failed:", logErr));
    }

    // Logged, not thrown: an email failure must not roll back the order,
    // password reset or enquiry that triggered it.
    console.error(`[GMAIL_SEND] Email send failed to ${to} (${type}):`, message);
    return { ok: false, error: message, retryable };
  }
}

/** Wraps dispatch so an unconfigured mailbox is a clear, non-throwing result. */
async function guardedDispatch(options: DispatchOptions): Promise<SendResult> {
  if (!(await isEmailConfigured())) {
    const msg =
      "Gmail is not connected. Connect the mailbox in Admin -> Settings -> Email.";
    console.warn(`[email] ${options.type} to ${options.to} not sent: ${msg}`);
    try {
      // Rendering may itself throw; the subject is only for the log line, so
      // fall back rather than turning a config warning into a crash.
      let subject = "(not rendered)";
      try {
        let logoUrl: string | null = null;
        try {
          const { getGlobalLogoUrl } = await import("@/components/brand/logo-source");
          logoUrl = await getGlobalLogoUrl();
        } catch {
          // ignore
        }
        subject = resolveRendered(options.rendered, logoUrl).subject;
      } catch {
        // keep the placeholder
      }
      await db.emailLog.create({
        data: {
          recipient: options.to,
          type: options.type,
          subject,
          status: EmailStatus.FAILED,
          error: msg,
          userId: options.userId ?? null,
          orderId: options.orderId ?? null,
          campaignId: options.campaignId ?? null,
        },
      });
    } catch {
      // The log is a convenience; never let it mask the real problem.
    }
    return { ok: false, error: msg, retryable: true };
  }

  try {
    return await dispatch(options);
  } catch (err) {
    if (err instanceof EmailConfigError || err instanceof EmailAuthError) {
      return { ok: false, error: err.message, retryable: false };
    }
    throw err;
  }
}

/** Admin recipient for internal notifications. */
export async function adminRecipient(): Promise<string | null> {
  const configured = process.env.ADMIN_EMAIL?.trim();
  if (configured) return configured;
  // Falling back to the sending mailbox beats dropping an alert silently, but
  // it is a fallback — ADMIN_EMAIL should be set.
  return (await inspectGmailConfig()).senderEmail;
}

export const EmailService = {
  isConfigured: isEmailConfigured,

  /** Low-level escape hatch for one-off internal messages. */
  async sendEmail(input: {
    to: string;
    type?: EmailType;
    rendered: RenderedEmail;
    replyTo?: string;
    userId?: string | null;
  }): Promise<SendResult> {
    return guardedDispatch({
      to: input.to,
      type: input.type ?? EmailType.ADMIN_NOTIFICATION,
      rendered: input.rendered,
      replyTo: input.replyTo,
      userId: input.userId ?? null,
    });
  },

  /**
   * Order confirmation, sent exactly once per order.
   *
   * Idempotency is enforced with a conditional update rather than a read-then-
   * write: `updateMany` filtered on `confirmationEmailSentAt: null` is atomic,
   * so two concurrent calls (a retried webhook, a double-clicked return trip)
   * cannot both claim the send. The loser sees count 0 and skips.
   */
  async sendOrderConfirmation(orderId: string): Promise<SendResult> {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        email: true,
        userId: true,
        createdAt: true,
        subtotalCents: true,
        shippingCents: true,
        taxCents: true,
        totalCents: true,
        paymentStatus: true,
        paymentMethod: true,
        shippingAddress: true,
        confirmationEmailSentAt: true,
        items: {
          select: { name: true, sku: true, quantity: true, priceCents: true, productId: true, variantId: true },
        },
      },
    });

    if (!order) return { ok: false, error: "Order not found." };
    if (order.confirmationEmailSentAt) {
      return { ok: true, skipped: true };
    }

    // Claim the send. Only the caller that flips null -> timestamp proceeds.
    const claim = await db.order.updateMany({
      where: { id: orderId, confirmationEmailSentAt: null },
      data: { confirmationEmailSentAt: new Date() },
    });
    if (claim.count === 0) {
      return { ok: true, skipped: true };
    }

    const productIds = order.items.map((i) => i.productId).filter(Boolean) as string[];
    const variantIds = order.items.map((i) => i.variantId).filter(Boolean) as string[];

    const productImages = productIds.length
      ? await db.productImage.findMany({
          where: { productId: { in: productIds } },
          orderBy: { position: "asc" },
          select: { productId: true, url: true },
        })
      : [];

    const variantImages = variantIds.length
      ? await db.productVariantImage.findMany({
          where: { variantId: { in: variantIds } },
          orderBy: { position: "asc" },
          select: { variantId: true, url: true },
        })
      : [];

    const firstProductImage = new Map<string, string>();
    for (const img of productImages) {
      if (!firstProductImage.has(img.productId)) firstProductImage.set(img.productId, img.url);
    }

    const firstVariantImage = new Map<string, string>();
    for (const img of variantImages) {
      if (!firstVariantImage.has(img.variantId)) firstVariantImage.set(img.variantId, img.url);
    }

    const address = (order.shippingAddress ?? null) as OrderEmailInput["shippingAddress"];
    const customerName = address?.fullName || order.email.split("@")[0];

    const renderMessage = (logoUrl: string | null) =>
      renderOrderConfirmation({
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customerName,
      email: order.email,
      items: order.items.map((item) => {
        let imageUrl: string | null = null;
        if (item.variantId) {
          imageUrl = firstVariantImage.get(item.variantId) ?? null;
        }
        if (!imageUrl && item.productId) {
          imageUrl = firstProductImage.get(item.productId) ?? null;
        }
        return {
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          priceCents: item.priceCents,
          imageUrl,
        };
      }),
      subtotalCents: order.subtotalCents,
      shippingCents: order.shippingCents,
      taxCents: order.taxCents,
      totalCents: order.totalCents,
      paymentStatus: order.paymentStatus ?? "PAID",
      paymentMethod: order.paymentMethod,
      shippingAddress: address,
        orderUrl: emailUrl(`/en/refurbished/account/orders/${order.orderNumber}`),
      }, logoUrl);

    const result = await guardedDispatch({
      to: order.email,
      type: EmailType.ORDER_CONFIRMATION,
      rendered: renderMessage,
      userId: order.userId,
      orderId: order.id,
    });

    if (!result.ok && result.retryable) {
      // Release the claim so a retry sweep can pick this order up again.
      // A permanent failure keeps the timestamp: resending would not help.
      await db.order
        .update({ where: { id: orderId }, data: { confirmationEmailSentAt: null } })
        .catch(() => undefined);
    }

    return result;
  },

  async sendPasswordReset(input: {
    to: string;
    name: string;
    resetUrl: string;
    expiresInMinutes: number;
    userId?: string | null;
  }): Promise<SendResult> {
    return guardedDispatch({
      to: input.to,
      type: EmailType.PASSWORD_RESET,
      rendered: (logoUrl) =>
        renderPasswordReset({
          name: input.name,
          resetUrl: input.resetUrl,
          expiresInMinutes: input.expiresInMinutes,
        }, logoUrl),
      userId: input.userId ?? null,
    });
  },

  /** Customer acknowledgement for a trade-in. Carries no valuation, by design. */
  async sendExchangeReceived(input: {
    to: string;
    name: string;
    referenceNumber: string;
    device: string;
    userId?: string | null;
  }): Promise<SendResult> {
    return guardedDispatch({
      to: input.to,
      type: EmailType.EXCHANGE_RECEIVED,
      rendered: (logoUrl) =>
        renderExchangeReceived({
          name: input.name,
          referenceNumber: input.referenceNumber,
          device: input.device,
        }, logoUrl),
      userId: input.userId ?? null,
    });
  },

  async sendExchangeAdminNotification(
    input: Parameters<typeof renderExchangeAdminNotification>[0] & { replyTo?: string },
  ): Promise<SendResult> {
    const to = await adminRecipient();
    if (!to) return { ok: false, error: "ADMIN_EMAIL is not set." };

    return guardedDispatch({
      to,
      type: EmailType.EXCHANGE_ADMIN_NOTIFICATION,
      rendered: (logoUrl) => renderExchangeAdminNotification(input, logoUrl),
      // Replying to the alert reaches the customer directly.
      replyTo: input.contactEmail ?? undefined,
    });
  },

  async sendContactNotification(
    input: Parameters<typeof renderContactNotification>[0],
  ): Promise<SendResult> {
    const to = await adminRecipient();
    if (!to) return { ok: false, error: "ADMIN_EMAIL is not set." };

    return guardedDispatch({
      to,
      type: EmailType.CONTACT_NOTIFICATION,
      rendered: (logoUrl) => renderContactNotification(input, logoUrl),
      replyTo: input.email,
    });
  },

  async sendContactAcknowledgement(input: { to: string; name: string }): Promise<SendResult> {
    return guardedDispatch({
      to: input.to,
      type: EmailType.CONTACT_ACKNOWLEDGEMENT,
      rendered: (logoUrl) => renderContactAcknowledgement({ name: input.name }, logoUrl),
    });
  },

  async sendAdminNotification(
    input: Parameters<typeof renderAdminNotification>[0],
  ): Promise<SendResult> {
    const to = await adminRecipient();
    if (!to) return { ok: false, error: "ADMIN_EMAIL is not set." };

    return guardedDispatch({
      to,
      type: EmailType.ADMIN_NOTIFICATION,
      rendered: (logoUrl) => renderAdminNotification(input, logoUrl),
    });
  },

  /** One marketing message. Campaign batching lives in lib/email/campaigns.ts. */
  async sendMarketingEmail(
    input: MarketingEmailInput & { to: string; campaignId?: string | null; userId?: string | null },
  ): Promise<SendResult> {
    return guardedDispatch({
      to: input.to,
      type: EmailType.MARKETING,
      rendered: (logoUrl) => renderMarketingEmail(input, logoUrl),
      listUnsubscribeUrl: input.unsubscribeUrl,
      campaignId: input.campaignId ?? null,
      userId: input.userId ?? null,
    });
  },

  async sendTestEmail(input: { to: string; triggeredBy: string }): Promise<SendResult> {
    const sender = (await inspectGmailConfig()).senderEmail ?? "unknown";
    return guardedDispatch({
      to: input.to,
      type: EmailType.TEST,
      rendered: (logoUrl) => renderTestEmail({ senderEmail: sender, triggeredBy: input.triggeredBy }, logoUrl),
    });
  },
};

export type EmailServiceType = typeof EmailService;
