import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { db } from "@/lib/db";
import { getCampaignRecipients } from "@/app/(backend)/(admin)/admin/marketing/actions";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  SENT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  QUEUED: "bg-slate-50 text-slate-600 ring-slate-200",
  SENDING: "bg-sky-50 text-sky-700 ring-sky-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
  BOUNCED: "bg-amber-50 text-amber-800 ring-amber-200",
};

/**
 * Read-only report for a campaign that has left DRAFT.
 *
 * Shows the delivery outcome per address, which is what someone actually needs
 * after a send: who got it, who did not, and why.
 */
export async function CampaignReport({ campaignId }: { campaignId: string }) {
  const [campaign, recipients] = await Promise.all([
    db.emailCampaign.findUnique({ where: { id: campaignId } }),
    getCampaignRecipients(campaignId, 500),
  ]);

  if (!campaign) return null;

  const unsubscribedSince = await db.user.count({
    where: {
      marketingConsent: false,
      marketingConsentAt: { gte: campaign.startedAt ?? campaign.createdAt },
    },
  });

  const stats = [
    { label: "Recipients", value: campaign.totalRecipients },
    { label: "Sent", value: campaign.sentCount },
    { label: "Failed", value: campaign.failedCount },
    { label: "Unsubscribed since", value: unsubscribedSince },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/marketing"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to campaigns</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {campaign.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{campaign.subject}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/80 bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border/60 p-6 pb-4">
          <h2 className="text-base font-semibold text-foreground">Delivery</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Showing {recipients.length} of {campaign.totalRecipients} recipients.
          </p>
        </div>

        <ul className="divide-y divide-border/60 lg:hidden">
          {recipients.map((row) => (
            <li key={row.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{row.email}</p>
                {row.error && <p className="text-xs font-medium text-red-700">{row.error}</p>}
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1",
                  STATUS_STYLES[row.status] ?? STATUS_STYLES.QUEUED,
                )}
              >
                {row.status}
              </span>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">Recipient</th>
                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                <th scope="col" className="px-6 py-3 font-semibold">Sent</th>
                <th scope="col" className="px-6 py-3 font-semibold">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recipients.map((row) => (
                <tr key={row.id}>
                  <td className="max-w-[260px] truncate px-6 py-3 text-foreground">{row.email}</td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-bold ring-1",
                        STATUS_STYLES[row.status] ?? STATUS_STYLES.QUEUED,
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-xs text-muted-foreground">
                    {row.sentAt ? new Date(row.sentAt).toLocaleString() : "—"}
                  </td>
                  <td className="max-w-[280px] truncate px-6 py-3 text-xs text-red-700">
                    {row.error ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
