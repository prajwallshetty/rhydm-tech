import "server-only";

import crypto from "node:crypto";

import { db } from "@/lib/db";
import {
  CampaignAudience,
  CampaignStatus,
  EmailStatus,
  PublishStatus,
} from "@/lib/generated/prisma/enums";
import { emailUrl } from "@/lib/email/layout";
import { EmailService } from "@/lib/email/service";
import type { MarketingProductCard } from "@/lib/email/templates/marketing";

/**
 * Campaign audience resolution and batched sending.
 *
 * A campaign can address thousands of people. Sending them inside the HTTP
 * request that clicks "Send" would hit the platform's response timeout, and any
 * failure part-way would leave no record of who had already been mailed. So the
 * recipient list is materialised up front and drained in small batches, each of
 * which commits its own progress. A send can then be resumed, retried, or
 * cancelled without ever double-mailing anyone.
 */

/** Gmail's per-day cap is far higher, but pacing avoids tripping rate limits. */
const BATCH_SIZE = 25;
const DELAY_BETWEEN_SENDS_MS = 120;
/**
 * How long a claim stays valid. A worker that dies mid-batch leaves rows in
 * SENDING; after this window another run may safely take them over. Generous
 * enough that a slow-but-alive send is never double-claimed.
 */
const STALE_CLAIM_MS = 10 * 60 * 1000;

export interface AudienceMember {
  email: string;
  name: string | null;
  userId: string | null;
}

/**
 * Resolves who a campaign goes to.
 *
 * Opt-in is filtered at the source in every branch. There is deliberately no
 * "everyone" option: consent is required, and a UI that can address people who
 * never gave it is a compliance problem waiting to happen.
 */
export async function resolveAudience(
  audience: CampaignAudience,
): Promise<AudienceMember[]> {
  const members = new Map<string, AudienceMember>();

  const addUser = (u: { email: string; name: string | null; id: string }) => {
    const key = u.email.toLowerCase();
    if (!members.has(key)) {
      members.set(key, { email: u.email, name: u.name, userId: u.id });
    }
  };

  if (
    audience === CampaignAudience.ALL_OPTED_IN ||
    audience === CampaignAudience.CUSTOMERS_WITH_ORDERS
  ) {
    const users = await db.user.findMany({
      where: {
        marketingConsent: true,
        status: "ACTIVE",
        ...(audience === CampaignAudience.CUSTOMERS_WITH_ORDERS
          ? { orders: { some: {} } }
          : {}),
      },
      select: { id: true, email: true, name: true },
    });
    users.forEach(addUser);
  }

  if (
    audience === CampaignAudience.ALL_OPTED_IN ||
    audience === CampaignAudience.NEWSLETTER_SUBSCRIBERS
  ) {
    const subscribers = await db.newsletterSubscriber.findMany({
      where: { consent: true },
      select: { email: true, name: true },
    });
    for (const sub of subscribers) {
      const key = sub.email.toLowerCase();
      if (!members.has(key)) {
        members.set(key, { email: sub.email, name: sub.name, userId: null });
      }
    }
  }

  return [...members.values()];
}

/** Generates and persists an unsubscribe token for a user who lacks one. */
async function ensureUserUnsubscribeToken(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { unsubscribeToken: true },
  });
  if (user?.unsubscribeToken) return user.unsubscribeToken;

  const token = crypto.randomBytes(32).toString("base64url");
  await db.user.update({ where: { id: userId }, data: { unsubscribeToken: token } });
  return token;
}

/**
 * Builds the unsubscribe URL for one recipient.
 *
 * The token identifies the subscription, not the person: it is random, unique,
 * and revealing it only lets the holder stop mail. That is the correct trade —
 * a link that required signing in would be ignored, and ignored unsubscribe
 * links become spam complaints.
 */
export async function unsubscribeUrlFor(member: AudienceMember): Promise<string> {
  if (member.userId) {
    const token = await ensureUserUnsubscribeToken(member.userId);
    return emailUrl(`/unsubscribe?token=${encodeURIComponent(token)}`);
  }

  const subscriber = await db.newsletterSubscriber.findUnique({
    where: { email: member.email },
    select: { unsubscribeToken: true },
  });
  if (subscriber?.unsubscribeToken) {
    return emailUrl(`/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`);
  }

  // No row to point at: fall back to the self-service form, which asks for the
  // address. Never send a marketing message with no way out.
  return emailUrl(`/unsubscribe?email=${encodeURIComponent(member.email)}`);
}

/** Loads the product cards a campaign features. */
export async function loadCampaignProducts(
  productIds: string[],
): Promise<MarketingProductCard[]> {
  if (!productIds.length) return [];

  const products = await db.product.findMany({
    where: { id: { in: productIds }, status: PublishStatus.PUBLISHED },
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      shortDescription: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
  });

  // Preserve the admin's chosen order rather than the database's.
  const byId = new Map(products.map((p) => [p.id, p]));
  return productIds
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      priceCents: p.priceCents,
      imageUrl: p.images[0]?.url ?? null,
      summary: p.shortDescription,
    }));
}

/**
 * Materialises the recipient list and moves the campaign to QUEUED.
 *
 * Snapshotting matters: resolving the audience lazily at send time would mean a
 * customer who unsubscribed mid-send might still be mailed, and a resumed send
 * could address a different set of people than the admin approved.
 */
export async function queueCampaign(campaignId: string): Promise<{
  ok: boolean;
  total: number;
  error?: string;
}> {
  const campaign = await db.emailCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { ok: false, total: 0, error: "Campaign not found." };
  if (campaign.status !== CampaignStatus.DRAFT) {
    return { ok: false, total: 0, error: `Campaign is already ${campaign.status}.` };
  }

  const members = await resolveAudience(campaign.audience);
  if (!members.length) {
    return { ok: false, total: 0, error: "No opted-in recipients match this audience." };
  }

  await db.$transaction([
    db.campaignRecipient.deleteMany({ where: { campaignId } }),
    db.campaignRecipient.createMany({
      data: members.map((m) => ({
        campaignId,
        email: m.email,
        name: m.name,
        userId: m.userId,
      })),
      skipDuplicates: true,
    }),
    db.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.QUEUED,
        totalRecipients: members.length,
        sentCount: 0,
        failedCount: 0,
      },
    }),
  ]);

  return { ok: true, total: members.length };
}

export interface BatchResult {
  processed: number;
  sent: number;
  failed: number;
  remaining: number;
  done: boolean;
}

/**
 * Sends the next batch of a queued campaign.
 *
 * Each recipient is claimed with a conditional update before sending, so two
 * concurrent workers cannot mail the same address twice. Returns how much is
 * left so the caller can drive the loop.
 */
export async function sendCampaignBatch(campaignId: string): Promise<BatchResult> {
  const campaign = await db.emailCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return { processed: 0, sent: 0, failed: 0, remaining: 0, done: true };
  }

  if (campaign.status === CampaignStatus.CANCELLED) {
    return { processed: 0, sent: 0, failed: 0, remaining: 0, done: true };
  }

  if (campaign.status === CampaignStatus.QUEUED) {
    await db.emailCampaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.SENDING, startedAt: campaign.startedAt ?? new Date() },
    });
  }

  // Reclaim anything a dead worker left in flight before picking new work.
  await db.campaignRecipient.updateMany({
    where: {
      campaignId,
      status: EmailStatus.SENDING,
      claimedAt: { lt: new Date(Date.now() - STALE_CLAIM_MS) },
    },
    data: { status: EmailStatus.QUEUED, claimedAt: null },
  });

  const batch = await db.campaignRecipient.findMany({
    where: { campaignId, status: EmailStatus.QUEUED },
    take: BATCH_SIZE,
    orderBy: { id: "asc" },
  });

  if (!batch.length) {
    const stillInFlight = await db.campaignRecipient.count({
      where: { campaignId, status: EmailStatus.SENDING },
    });
    // Another worker still holds claims; leave the campaign open for it.
    if (stillInFlight > 0) {
      return { processed: 0, sent: 0, failed: 0, remaining: stillInFlight, done: false };
    }
    return finaliseCampaign(campaignId);
  }

  const products = await loadCampaignProducts(campaign.productIds);
  let sent = 0;
  let failed = 0;

  for (const recipient of batch) {
    // Claim it by flipping QUEUED -> SENDING in one conditional update. If
    // another worker got there first the count is 0 and this one skips, which
    // is what stops the same address being mailed twice.
    const claim = await db.campaignRecipient.updateMany({
      where: { id: recipient.id, status: EmailStatus.QUEUED },
      data: { status: EmailStatus.SENDING, claimedAt: new Date() },
    });
    if (claim.count === 0) continue;

    const unsubscribeUrl = await unsubscribeUrlFor({
      email: recipient.email,
      name: recipient.name,
      userId: recipient.userId,
    });

    const result = await EmailService.sendMarketingEmail({
      to: recipient.email,
      recipientName: recipient.name,
      subject: campaign.subject,
      previewText: campaign.previewText,
      bodyHtml: campaign.bodyHtml,
      bodyText: campaign.bodyText,
      products,
      unsubscribeUrl,
      campaignId,
      userId: recipient.userId,
    });

    if (result.ok) {
      sent += 1;
      await db.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: EmailStatus.SENT,
          sentAt: new Date(),
          claimedAt: null,
          attempts: { increment: 1 },
          error: null,
        },
      });
    } else {
      failed += 1;
      await db.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          // Retryable failures go back to QUEUED so a later run picks them up;
          // permanent ones are parked so they are never attempted again.
          status: result.retryable ? EmailStatus.QUEUED : EmailStatus.BOUNCED,
          claimedAt: null,
          attempts: { increment: 1 },
          error: result.error ?? "Unknown failure",
        },
      });
    }

    // Gentle pacing. Gmail throttles aggressive bursts from a single mailbox.
    if (DELAY_BETWEEN_SENDS_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_SENDS_MS));
    }
  }

  await db.emailCampaign.update({
    where: { id: campaignId },
    data: {
      sentCount: { increment: sent },
      failedCount: { increment: failed },
    },
  });

  // Counts in-flight rows as well: finalising while a claim is outstanding
  // would mark the campaign complete with someone never mailed.
  const remaining = await db.campaignRecipient.count({
    where: { campaignId, status: { in: [EmailStatus.QUEUED, EmailStatus.SENDING] } },
  });

  if (remaining === 0) {
    const final = await finaliseCampaign(campaignId);
    return { ...final, processed: batch.length, sent, failed };
  }

  return { processed: batch.length, sent, failed, remaining, done: false };
}

/** Marks a drained campaign SENT, or PARTIAL when some addresses failed. */
async function finaliseCampaign(campaignId: string): Promise<BatchResult> {
  const [failedCount, sentCount] = await Promise.all([
    db.campaignRecipient.count({
      where: { campaignId, status: { in: [EmailStatus.FAILED, EmailStatus.BOUNCED] } },
    }),
    db.campaignRecipient.count({ where: { campaignId, status: EmailStatus.SENT } }),
  ]);

  await db.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status:
        failedCount === 0
          ? CampaignStatus.SENT
          : sentCount === 0
            ? CampaignStatus.FAILED
            : CampaignStatus.PARTIAL,
      completedAt: new Date(),
      sentCount,
      failedCount,
    },
  });

  return { processed: 0, sent: 0, failed: 0, remaining: 0, done: true };
}

/**
 * Drains a whole campaign.
 *
 * Runs detached from the request that started it (the caller does not await),
 * so the admin gets an immediate response and progress is polled from the
 * campaign row.
 */
export async function drainCampaign(campaignId: string): Promise<void> {
  // A hard ceiling stops a bug in the claim logic from looping forever.
  for (let i = 0; i < 10_000; i += 1) {
    const result = await sendCampaignBatch(campaignId);
    if (result.done) return;

    const campaign = await db.emailCampaign.findUnique({
      where: { id: campaignId },
      select: { status: true },
    });
    if (campaign?.status === CampaignStatus.CANCELLED) return;
  }
}
