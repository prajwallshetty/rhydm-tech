import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import {
  getEmailConnectionStatus,
  getRecentEmailLogs,
} from "@/app/(backend)/(admin)/admin/settings/email/actions";

import { EmailSettingsClient } from "./email-settings-client";

export const metadata = {
  title: "Email settings",
};

/**
 * Admin → Settings → Email.
 *
 * Server component: the connection status is resolved here so no secret value
 * is ever serialised into the client bundle. Only booleans, the sender address
 * and the redirect URI cross the boundary.
 */
export default async function AdminEmailSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [status, logs] = await Promise.all([
    getEmailConnectionStatus(),
    getRecentEmailLogs(25),
  ]);

  const readParam = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : null;
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin/settings" className="flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Site Settings</span>
          </Link>
        </div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          <Mail className="h-8 w-8 text-primary" />
          <span>Email</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Outbound mail is sent through a Google Workspace mailbox using the Gmail API.
          Connect it once here; access tokens refresh automatically after that.
        </p>
      </div>

      <EmailSettingsClient
        status={status}
        logs={logs}
        connected={readParam("connected") === "1"}
        notice={readParam("notice")}
        errorMessage={readParam("error")}
      />
    </div>
  );
}
