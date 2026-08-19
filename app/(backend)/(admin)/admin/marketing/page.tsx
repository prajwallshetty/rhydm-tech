import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { hasPermission } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { EmailService } from "@/lib/email/service";

import { CampaignList } from "./campaign-list";

export const metadata = { title: "Marketing emails" };

/** Admin → Marketing → Emails. Campaign overview and entry point. */
export default async function AdminMarketingPage() {
  const admin = await requireAdmin();
  if (!hasPermission(admin.role, "SYSTEM_SETTINGS")) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-6 text-sm font-medium text-amber-900">
        You do not have permission to manage marketing campaigns.
      </div>
    );
  }

  const [campaigns, optedInUsers, subscribers, mailboxReady] = await Promise.all([
    db.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        subject: true,
        audience: true,
        status: true,
        totalRecipients: true,
        sentCount: true,
        failedCount: true,
        createdAt: true,
        completedAt: true,
      },
    }),
    db.user.count({ where: { marketingConsent: true, status: "ACTIVE" } }),
    db.newsletterSubscriber.count({ where: { consent: true } }),
    EmailService.isConfigured(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            <Megaphone className="h-8 w-8 text-primary" />
            <span>Marketing emails</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Campaigns reach only people who explicitly opted in. Every message carries an
            unsubscribe link.
          </p>
        </div>

        <Link
          href="/admin/marketing/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span>New campaign</span>
        </Link>
      </div>

      {!mailboxReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs font-medium leading-relaxed text-amber-900">
          The Gmail mailbox is not connected, so campaigns cannot be sent yet.{" "}
          <Link href="/admin/settings/email" className="underline underline-offset-2">
            Connect it in Settings → Email
          </Link>
          .
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground">Opted-in customers</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{optedInUsers}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground">Newsletter subscribers</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{subscribers}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground">Campaigns</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{campaigns.length}</p>
        </div>
      </div>

      <CampaignList
        campaigns={campaigns.map((campaign) => ({
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
          completedAt: campaign.completedAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
