"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { recordAuditLog } from "@/lib/auth/audit";
import { hasPermission } from "@/lib/auth/rbac";
import { clearStoredRefreshToken, describeStoredCredential } from "@/lib/email/credentials";
import { getGmailRedirectUri, GMAIL_SEND_SCOPE, inspectGmailConfig } from "@/lib/email/oauth";
import { adminRecipient, EmailService } from "@/lib/email/service";

/**
 * Admin actions for the email settings page.
 *
 * Every function here re-checks the caller's permission. A Server Action is a
 * public endpoint: being rendered inside an admin page proves nothing about who
 * is invoking it.
 */

async function requireSettingsAdmin() {
  const admin = await requireAdmin();
  if (!hasPermission(admin.role, "SYSTEM_SETTINGS")) {
    throw new Error("You do not have permission to manage email settings.");
  }
  return admin;
}

export interface EmailConnectionStatus {
  configured: boolean;
  problems: string[];
  senderEmail: string | null;
  adminEmail: string | null;
  tokenFromStore: boolean;
  redirectUri: string;
  scope: string;
  storedCredential: {
    present: boolean;
    senderEmail: string | null;
    connectedAt: string | null;
  } | null;
}

/**
 * Connection state for the settings page.
 *
 * Returns booleans, the sender address and the redirect URI — all non-secret.
 * The client id, client secret and refresh token never leave the server.
 */
export async function getEmailConnectionStatus(): Promise<EmailConnectionStatus> {
  await requireSettingsAdmin();

  const config = await inspectGmailConfig();
  const stored = await describeStoredCredential();

  return {
    configured: config.configured,
    problems: config.problems,
    senderEmail: config.senderEmail,
    adminEmail: (await adminRecipient()) ?? null,
    tokenFromStore: config.tokenFromStore,
    redirectUri: getGmailRedirectUri(),
    scope: GMAIL_SEND_SCOPE,
    storedCredential: stored
      ? {
          present: stored.present,
          senderEmail: stored.senderEmail,
          connectedAt: stored.connectedAt?.toISOString() ?? null,
        }
      : null,
  };
}

export type TestEmailResult = { ok: true; sentTo: string } | { ok: false; error: string };

/** Sends a test message so the admin can confirm delivery end to end. */
export async function sendTestEmailAction(recipient?: string): Promise<TestEmailResult> {
  const admin = await requireSettingsAdmin();

  const to = (recipient?.trim() || admin.email || "").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
    return { ok: false, error: "Enter a valid email address to send the test to." };
  }

  const result = await EmailService.sendTestEmail({ to, triggeredBy: admin.email });

  await recordAuditLog({
    userId: admin.id,
    email: admin.email,
    action: "EMAIL_TEST_SENT",
    status: result.ok ? "SUCCESS" : "FAILURE",
    details: { to, error: result.ok ? undefined : result.error },
  });

  if (!result.ok) {
    return { ok: false, error: result.error ?? "The test message could not be sent." };
  }
  return { ok: true, sentTo: to };
}

/**
 * Forgets the stored refresh token.
 *
 * Only clears what this app holds. The grant still exists on Google's side
 * until it is revoked at myaccount.google.com/permissions, which the UI says.
 */
export async function disconnectGmailAction(): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireSettingsAdmin();

  try {
    await clearStoredRefreshToken();
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not clear the stored credential.",
    };
  }

  await recordAuditLog({
    userId: admin.id,
    email: admin.email,
    action: "GMAIL_OAUTH_DISCONNECTED",
  });

  revalidatePath("/admin/settings/email");
  return { ok: true };
}

/** Recent send history, newest first. Powers the activity table. */
export async function getRecentEmailLogs(limit = 25) {
  await requireSettingsAdmin();

  const { db } = await import("@/lib/db");
  const logs = await db.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
    select: {
      id: true,
      recipient: true,
      type: true,
      subject: true,
      status: true,
      error: true,
      createdAt: true,
      sentAt: true,
    },
  });

  return logs.map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
    sentAt: log.sentAt?.toISOString() ?? null,
  }));
}
