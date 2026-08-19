"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Play, RotateCcw, Send, XCircle } from "lucide-react";

import {
  cancelCampaignAction,
  resumeCampaignAction,
  sendCampaignAction,
} from "@/app/(backend)/(admin)/admin/marketing/actions";
import { cn } from "@/lib/utils";

interface CampaignRow {
  id: string;
  name: string;
  subject: string;
  audience: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  completedAt: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-50 text-slate-600 ring-slate-200",
  QUEUED: "bg-sky-50 text-sky-700 ring-sky-200",
  SENDING: "bg-sky-50 text-sky-700 ring-sky-200",
  SENT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PARTIAL: "bg-amber-50 text-amber-800 ring-amber-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
  CANCELLED: "bg-slate-100 text-slate-500 ring-slate-200",
};

const AUDIENCE_LABELS: Record<string, string> = {
  ALL_OPTED_IN: "All opted-in",
  NEWSLETTER_SUBSCRIBERS: "Newsletter",
  CUSTOMERS_WITH_ORDERS: "Past customers",
};

export function CampaignList({ campaigns }: { campaigns: CampaignRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  /**
   * Sending is irreversible once messages leave, so it takes an explicit
   * confirmation naming the campaign — a mis-click here mails real customers.
   */
  const handleSend = (campaign: CampaignRow) => {
    const confirmed = window.confirm(
      `Send "${campaign.name}" now?\n\nThis emails every opted-in recipient in the "${
        AUDIENCE_LABELS[campaign.audience] ?? campaign.audience
      }" audience and cannot be undone.`,
    );
    if (!confirmed) return;

    setError(null);
    setBusyId(campaign.id);
    startTransition(async () => {
      const result = await sendCampaignAction(campaign.id);
      setBusyId(null);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  };

  const runAction = (
    id: string,
    action: (id: string) => Promise<{ ok: boolean; error?: string }>,
  ) => {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await action(id);
      setBusyId(null);
      if (!result.ok && result.error) setError(result.error);
      else router.refresh();
    });
  };

  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
        <p className="text-sm font-semibold text-foreground">No campaigns yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
          Create a campaign to send product news or an announcement to customers who opted in.
        </p>
        <Link
          href="/admin/marketing/new"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          New campaign
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}

      {campaigns.map((campaign) => {
        const busy = busyId === campaign.id;
        const progress =
          campaign.totalRecipients > 0
            ? Math.round(((campaign.sentCount + campaign.failedCount) / campaign.totalRecipients) * 100)
            : 0;

        return (
          <div
            key={campaign.id}
            className="rounded-xl border border-border/80 bg-card p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">{campaign.name}</h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold ring-1",
                      STATUS_STYLES[campaign.status] ?? STATUS_STYLES.DRAFT,
                    )}
                  >
                    {campaign.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{campaign.subject}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {AUDIENCE_LABELS[campaign.audience] ?? campaign.audience}
                  {campaign.totalRecipients > 0 && (
                    <>
                      {" · "}
                      {campaign.sentCount} sent
                      {campaign.failedCount > 0 && `, ${campaign.failedCount} failed`}
                      {" of "}
                      {campaign.totalRecipients}
                    </>
                  )}
                  {" · "}
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </p>

                {(campaign.status === "SENDING" || campaign.status === "QUEUED") && (
                  <div
                    className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${campaign.name} send progress`}
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {campaign.status === "DRAFT" && (
                  <>
                    <Link
                      href={`/admin/marketing/${campaign.id}`}
                      className="inline-flex min-h-11 items-center rounded-lg border border-input px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSend(campaign)}
                      disabled={busy}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      <span>{busy ? "Queueing…" : "Send"}</span>
                    </button>
                  </>
                )}

                {(campaign.status === "SENDING" || campaign.status === "QUEUED") && (
                  <button
                    type="button"
                    onClick={() => runAction(campaign.id, cancelCampaignAction)}
                    disabled={busy}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-input px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span>Cancel</span>
                  </button>
                )}

                {(campaign.status === "PARTIAL" ||
                  campaign.status === "FAILED" ||
                  campaign.status === "CANCELLED") && (
                  <button
                    type="button"
                    onClick={() => runAction(campaign.id, resumeCampaignAction)}
                    disabled={busy}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-input px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : campaign.status === "CANCELLED" ? (
                      <Play className="h-3.5 w-3.5" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    <span>Resume</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
