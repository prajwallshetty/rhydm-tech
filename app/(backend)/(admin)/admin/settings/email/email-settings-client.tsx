"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Info,
  Link2,
  Loader2,
  Send,
  Unplug,
} from "lucide-react";

import {
  disconnectGmailAction,
  sendTestEmailAction,
  type EmailConnectionStatus,
} from "@/app/(backend)/(admin)/admin/settings/email/actions";
import { cn } from "@/lib/utils";

interface EmailLogRow {
  id: string;
  recipient: string;
  type: string;
  subject: string;
  status: string;
  error: string | null;
  createdAt: string;
  sentAt: string | null;
}

const PROBLEM_LABELS: Record<string, string> = {
  MISSING_CLIENT_ID: "GOOGLE_CLIENT_ID is not set",
  MISSING_CLIENT_SECRET: "GOOGLE_CLIENT_SECRET is not set",
  MISSING_SENDER: "GOOGLE_EMAIL is not set",
  MISSING_REFRESH_TOKEN: "The mailbox has not been connected yet",
};

const STATUS_STYLES: Record<string, string> = {
  SENT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  QUEUED: "bg-slate-50 text-slate-600 ring-slate-200",
  SENDING: "bg-sky-50 text-sky-700 ring-sky-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
  BOUNCED: "bg-amber-50 text-amber-800 ring-amber-200",
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex items-stretch gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-input bg-muted/40 px-3 py-2 text-xs text-foreground">
          {value}
        </code>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(value).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            });
          }}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          aria-label={`Copy ${label}`}
        >
          {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}

export function EmailSettingsClient({
  status,
  logs,
  connected,
  notice,
  errorMessage,
}: {
  status: EmailConnectionStatus;
  logs: EmailLogRow[];
  connected: boolean;
  notice: string | null;
  errorMessage: string | null;
}) {
  const [testTo, setTestTo] = useState(status.adminEmail ?? "");
  const [testState, setTestState] = useState<
    { kind: "idle" } | { kind: "ok"; to: string } | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [sending, startSending] = useTransition();
  const [disconnecting, startDisconnecting] = useTransition();

  const handleTest = () => {
    setTestState({ kind: "idle" });
    startSending(async () => {
      const result = await sendTestEmailAction(testTo);
      setTestState(
        result.ok
          ? { kind: "ok", to: result.sentTo }
          : { kind: "error", message: result.error },
      );
    });
  };

  const handleDisconnect = () => {
    startDisconnecting(async () => {
      await disconnectGmailAction();
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      {connected && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs font-medium leading-relaxed text-emerald-900"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Gmail authorised successfully. Send a test message below to confirm delivery.</span>
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs font-medium leading-relaxed text-sky-900"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 p-4 text-xs font-medium leading-relaxed text-red-900"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Connection */}
      <section className="space-y-5 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Connection</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Google Gmail (Workspace)</p>
          </div>
          <span
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1",
              status.configured
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-amber-50 text-amber-800 ring-amber-200",
            )}
          >
            {status.configured ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {status.configured ? "Connected" : "Not connected"}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Sending address</dt>
            <dd className="mt-1 break-all text-sm font-medium text-foreground">
              {status.senderEmail ?? <span className="text-amber-700">GOOGLE_EMAIL not set</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Admin alerts go to</dt>
            <dd className="mt-1 break-all text-sm font-medium text-foreground">
              {status.adminEmail ?? <span className="text-amber-700">ADMIN_EMAIL not set</span>}
            </dd>
          </div>
        </dl>

        {!status.configured && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs font-semibold leading-relaxed text-amber-900"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Gmail is not connected. Password reset and other system emails cannot be sent until a
              mailbox is connected.
            </span>
          </div>
        )}

        {status.problems.length > 0 && (
          <ul className="space-y-1.5 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
            {status.problems.map((problem) => (
              <li key={problem} className="flex items-start gap-2 text-xs font-medium text-amber-900">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{PROBLEM_LABELS[problem] ?? problem}</span>
              </li>
            ))}
          </ul>
        )}

        {status.tokenFromStore && (
          <p className="text-xs text-muted-foreground">
            The refresh token is held in this application&rsquo;s encrypted credential store.
            Setting <code className="font-mono">GOOGLE_REFRESH_TOKEN</code> in the environment
            overrides it.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <a
            href="/api/email/google/connect"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Link2 className="h-4 w-4" />
            <span>{status.configured ? "Reconnect Gmail" : "Connect Gmail"}</span>
          </a>

          {status.storedCredential?.present && (
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-input px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
              <span>{disconnecting ? "Disconnecting…" : "Disconnect"}</span>
            </button>
          )}
        </div>
      </section>

      {/* Google Cloud configuration */}
      <section className="space-y-4 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-base font-semibold text-foreground">Google Cloud configuration</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add these exactly to your OAuth 2.0 Client before connecting.
          </p>
        </div>

        <CopyField label="Authorised redirect URI" value={status.redirectUri} />
        <CopyField label="OAuth scope" value={status.scope} />

        <p className="text-xs leading-relaxed text-muted-foreground">
          The Gmail send scope is separate from the &ldquo;Sign in with Google&rdquo; login on the
          storefront. Both can live on the same OAuth client, but this redirect URI must be
          listed alongside the login one.
        </p>
      </section>

      {/* Test */}
      <section className="space-y-4 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-base font-semibold text-foreground">Send a test email</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Confirms the whole path: token refresh, Gmail API, and delivery.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="test-recipient" className="text-xs font-semibold text-muted-foreground">
              Recipient
            </label>
            <input
              id="test-recipient"
              type="email"
              value={testTo}
              onChange={(event) => setTestTo(event.target.value)}
              placeholder="you@rhydm-tech.com"
              className="min-h-11 w-full rounded-lg border border-input bg-background/50 px-3.5 text-base outline-none focus:border-primary sm:text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleTest}
            disabled={sending || !status.configured}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>{sending ? "Sending…" : "Send test"}</span>
          </button>
        </div>

        {!status.configured && (
          <p className="text-xs text-amber-800">Connect the mailbox before sending a test.</p>
        )}
        {testState.kind === "ok" && (
          <p role="status" className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Test message sent to {testState.to}.
          </p>
        )}
        {testState.kind === "error" && (
          <p role="alert" className="flex items-start gap-2 text-xs font-semibold text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {testState.message}
          </p>
        )}
      </section>

      {/* Activity */}
      <section className="rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border/60 p-6 pb-4">
          <h2 className="text-base font-semibold text-foreground">Recent activity</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The last {logs.length} send attempts. Message bodies are never stored.
          </p>
        </div>

        {logs.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No emails have been sent yet.</p>
        ) : (
          <>
            {/* Cards on small screens; a 5-column table needs more width than a phone has. */}
            <ul className="divide-y divide-border/60 lg:hidden">
              {logs.map((log) => (
                <li key={log.id} className="space-y-1.5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                      {log.subject}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1",
                        STATUS_STYLES[log.status] ?? STATUS_STYLES.QUEUED,
                      )}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{log.recipient}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.type} · {new Date(log.createdAt).toLocaleString()}
                  </p>
                  {log.error && <p className="text-xs font-medium text-red-700">{log.error}</p>}
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold">Recipient</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Type</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Subject</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-3 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="max-w-[200px] truncate px-6 py-3 text-foreground">{log.recipient}</td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">{log.type}</td>
                      <td className="max-w-[260px] truncate px-6 py-3 text-muted-foreground">
                        {log.subject}
                        {log.error && (
                          <span className="block text-xs font-medium text-red-700">{log.error}</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-bold ring-1",
                            STATUS_STYLES[log.status] ?? STATUS_STYLES.QUEUED,
                          )}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
