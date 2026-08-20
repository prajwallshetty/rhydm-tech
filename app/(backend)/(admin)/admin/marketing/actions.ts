"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin";
import { recordAuditLog } from "@/lib/auth/audit";
import { hasPermission } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/business";
import {
  drainCampaign,
  loadCampaignProducts,
  queueCampaign,
  resolveAudience,
  unsubscribeUrlFor,
} from "@/lib/email/campaigns";
import { sanitizeEmailHtml } from "@/lib/email/sanitize";
import { EmailService } from "@/lib/email/service";
import { renderMarketingEmail } from "@/lib/email/templates/marketing";
import { htmlToText } from "@/lib/email/layout";
import {
  CampaignAudience,
  CampaignStatus,
  PublishStatus,
} from "@/lib/generated/prisma/enums";

/**
 * Marketing campaign administration.
 *
 * Sending is gated behind an explicit two-step flow — save a draft, then queue
 * it — so a campaign can never go out as a side effect of editing one.
 */

async function requireMarketingAdmin() {
  const admin = await requireAdmin();
  // Marketing mail carries the company's name to thousands of inboxes; treat it
  // with the same seriousness as system settings rather than as content edits.
  if (!hasPermission(admin.role, "SYSTEM_SETTINGS")) {
    throw new Error("You do not have permission to manage marketing campaigns.");
  }
  return admin;
}

const campaignSchema = z.object({
  name: z.string().trim().min(2, "Give the campaign a name.").max(120),
  subject: z.string().trim().min(2, "A subject line is required.").max(200),
  previewText: z.string().trim().max(200).optional().nullable(),
  bodyHtml: z.string().trim().min(1, "The email needs some content.").max(100_000),
  bodyText: z.string().trim().max(100_000).optional().nullable(),
  audience: z.enum(["ALL_OPTED_IN", "NEWSLETTER_SUBSCRIBERS", "CUSTOMERS_WITH_ORDERS", "CUSTOM_EMAILS"]),
  customEmails: z.string().trim().max(10_000).optional().nullable(),
  productIds: z.array(z.string().trim().min(1)).max(8).default([]),
});

export type CampaignInput = z.infer<typeof campaignSchema>;

export type CampaignActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Creates or updates a draft. Only drafts are editable. */
export async function saveCampaignAction(
  input: CampaignInput & { id?: string },
): Promise<CampaignActionResult> {
  const admin = await requireMarketingAdmin();

  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the fields." };
  }
  const data = parsed.data;

  // Sanitised on the way in as well as at send time. Two passes because the
  // stored value is also what the admin preview renders.
  const bodyHtml = sanitizeEmailHtml(data.bodyHtml);
  if (!bodyHtml.trim()) {
    return { ok: false, error: "The content was empty after removing unsupported markup." };
  }

  const payload = {
    name: data.name,
    subject: data.subject,
    previewText: data.previewText || null,
    bodyHtml,
    bodyText: data.bodyText || htmlToText(bodyHtml),
    audience: data.audience as CampaignAudience,
    customEmails: data.customEmails || null,
    productIds: data.productIds,
  };

  try {
    if (input.id) {
      const existing = await db.emailCampaign.findUnique({
        where: { id: input.id },
        select: { status: true },
      });
      if (!existing) return { ok: false, error: "Campaign not found." };
      if (existing.status !== CampaignStatus.DRAFT) {
        return { ok: false, error: "Only drafts can be edited. Duplicate it instead." };
      }

      await db.emailCampaign.update({ where: { id: input.id }, data: payload });
      await recordAuditLog({
        userId: admin.id,
        email: admin.email,
        action: "CAMPAIGN_UPDATED",
        details: { campaignId: input.id, name: payload.name },
      });

      revalidatePath("/admin/marketing");
      return { ok: true, id: input.id };
    }

    const created = await db.emailCampaign.create({
      data: { ...payload, createdById: admin.id },
      select: { id: true },
    });

    await recordAuditLog({
      userId: admin.id,
      email: admin.email,
      action: "CAMPAIGN_CREATED",
      details: { campaignId: created.id, name: payload.name },
    });

    revalidatePath("/admin/marketing");
    return { ok: true, id: created.id };
  } catch (error) {
    console.error("[marketing] save failed:", error);
    return { ok: false, error: "Could not save the campaign." };
  }
}

/** Saves a campaign draft and immediately queues it for sending in one click. */
export async function saveAndSendCampaignAction(
  input: CampaignInput & { id?: string },
): Promise<{ ok: true; id: string; total: number } | { ok: false; error: string }> {
  const saveResult = await saveCampaignAction(input);
  if (!saveResult.ok) {
    return saveResult;
  }

  const sendResult = await sendCampaignAction(saveResult.id);
  if (!sendResult.ok) {
    return sendResult;
  }

  return { ok: true, id: saveResult.id, total: sendResult.total };
}

/** How many people a given audience currently resolves to. */
export async function countAudienceAction(
  audience: CampaignInput["audience"],
  customEmails?: string | null,
): Promise<number> {
  await requireMarketingAdmin();
  const members = await resolveAudience(audience as CampaignAudience, customEmails);
  return members.length;
}

/** Renders the campaign exactly as a recipient would see it. */
export async function previewCampaignAction(
  input: CampaignInput,
): Promise<{ ok: true; html: string } | { ok: false; error: string }> {
  await requireMarketingAdmin();

  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the fields." };
  }

  const products = await loadCampaignProducts(parsed.data.productIds);
  const { html } = renderMarketingEmail({
    subject: parsed.data.subject,
    previewText: parsed.data.previewText ?? null,
    bodyHtml: parsed.data.bodyHtml,
    bodyText: parsed.data.bodyText ?? null,
    products,
    // A placeholder: the real link is per-recipient and minted at send time.
    unsubscribeUrl: "#preview-unsubscribe",
    recipientName: "Alex",
  });

  return { ok: true, html };
}

/** Sends one copy to a chosen address before committing to the whole list. */
export async function sendCampaignTestAction(
  input: CampaignInput & { to: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireMarketingAdmin();

  const to = input.to.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
    return { ok: false, error: "Enter a valid address for the test." };
  }

  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the fields." };
  }

  const products = await loadCampaignProducts(parsed.data.productIds);
  const result = await EmailService.sendMarketingEmail({
    to,
    recipientName: admin.name ?? null,
    subject: `[TEST] ${parsed.data.subject}`,
    previewText: parsed.data.previewText ?? null,
    bodyHtml: parsed.data.bodyHtml,
    bodyText: parsed.data.bodyText ?? null,
    products,
    unsubscribeUrl: `${SITE_URL.replace(/\/+$/, "")}/unsubscribe`,
  });

  return result.ok ? { ok: true } : { ok: false, error: result.error ?? "Test send failed." };
}

/**
 * Queues a campaign and starts draining it.
 *
 * The drain is deliberately not awaited: a few thousand messages take minutes,
 * far longer than an HTTP request should live. The admin gets an immediate
 * response and watches progress through the campaign row, which each batch
 * updates as it commits.
 */
export async function sendCampaignAction(
  campaignId: string,
): Promise<{ ok: true; total: number } | { ok: false; error: string }> {
  const admin = await requireMarketingAdmin();

  if (!(await EmailService.isConfigured())) {
    return { ok: false, error: "Connect the Gmail mailbox before sending a campaign." };
  }

  const queued = await queueCampaign(campaignId);
  if (!queued.ok) return { ok: false, error: queued.error ?? "Could not queue the campaign." };

  await recordAuditLog({
    userId: admin.id,
    email: admin.email,
    action: "CAMPAIGN_SENT",
    details: { campaignId, recipients: queued.total },
  });

  after(async () => {
    try {
      await drainCampaign(campaignId);
    } catch (error) {
      console.error("[marketing] campaign drain failed:", error);
    }
  });

  revalidatePath("/admin/marketing");
  return { ok: true, total: queued.total };
}

/** Stops a send. Anything already delivered stays delivered. */
export async function cancelCampaignAction(
  campaignId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireMarketingAdmin();

  const campaign = await db.emailCampaign.findUnique({
    where: { id: campaignId },
    select: { status: true },
  });
  if (!campaign) return { ok: false, error: "Campaign not found." };
  if (campaign.status === CampaignStatus.SENT) {
    return { ok: false, error: "This campaign has already finished sending." };
  }

  await db.emailCampaign.update({
    where: { id: campaignId },
    data: { status: CampaignStatus.CANCELLED, completedAt: new Date() },
  });

  await recordAuditLog({
    userId: admin.id,
    email: admin.email,
    action: "CAMPAIGN_CANCELLED",
    details: { campaignId },
  });

  revalidatePath("/admin/marketing");
  return { ok: true };
}

/** Resumes a partial or failed campaign, retrying only what has not been sent. */
export async function resumeCampaignAction(
  campaignId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireMarketingAdmin();

  const campaign = await db.emailCampaign.findUnique({
    where: { id: campaignId },
    select: { status: true },
  });
  if (!campaign) return { ok: false, error: "Campaign not found." };
  if (
    campaign.status !== CampaignStatus.PARTIAL &&
    campaign.status !== CampaignStatus.FAILED &&
    campaign.status !== CampaignStatus.CANCELLED
  ) {
    return { ok: false, error: `A ${campaign.status} campaign cannot be resumed.` };
  }

  // Only addresses that failed retryably go back in the queue. BOUNCED rows are
  // left alone: the address is permanently unusable, and retrying it forever
  // damages the sending domain's reputation.
  await db.campaignRecipient.updateMany({
    where: { campaignId, status: "FAILED" },
    data: { status: "QUEUED", claimedAt: null },
  });

  await db.emailCampaign.update({
    where: { id: campaignId },
    data: { status: CampaignStatus.SENDING, completedAt: null },
  });

  after(async () => {
    try {
      await drainCampaign(campaignId);
    } catch (error) {
      console.error("[marketing] campaign resume failed:", error);
    }
  });

  revalidatePath("/admin/marketing");
  return { ok: true };
}

/** Published products, for the campaign product picker. */
export async function listProductsForCampaign() {
  await requireMarketingAdmin();

  return db.product.findMany({
    where: { status: PublishStatus.PUBLISHED },
    orderBy: { name: "asc" },
    take: 200,
    select: { id: true, name: true, slug: true, priceCents: true },
  });
}

/** Per-recipient outcome for one campaign, newest failures first. */
export async function getCampaignRecipients(campaignId: string, limit = 100) {
  await requireMarketingAdmin();

  const rows = await db.campaignRecipient.findMany({
    where: { campaignId },
    orderBy: [{ status: "asc" }, { email: "asc" }],
    take: Math.min(Math.max(limit, 1), 500),
    select: { id: true, email: true, status: true, error: true, sentAt: true },
  });

  return rows.map((row) => ({ ...row, sentAt: row.sentAt?.toISOString() ?? null }));
}

/** Preview of who a campaign would reach, without queueing anything. */
export async function previewAudienceAction(
  audience: CampaignInput["audience"],
  customEmails?: string | null,
) {
  await requireMarketingAdmin();

  const members = await resolveAudience(audience as CampaignAudience, customEmails);
  const sample = await Promise.all(
    members.slice(0, 5).map(async (member) => ({
      email: member.email,
      hasUnsubscribeLink: Boolean(await unsubscribeUrlFor(member)),
    })),
  );

  return { total: members.length, sample };
}
