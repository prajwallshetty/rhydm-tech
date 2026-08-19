import { headers } from "next/headers";
import { db } from "@/lib/db";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "GOOGLE_LOGIN"
  | "LOGOUT"
  | "SIGNUP"
  | "PASSWORD_CHANGE"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_SUCCESS"
  | "EMAIL_VERIFICATION"
  | "PROFILE_UPDATE"
  | "ROLE_CHANGE"
  | "USER_SUSPENDED"
  | "USER_ACTIVATED"
  | "USER_DELETED"
  // Email system. Connecting the sending mailbox rebinds where all outbound
  // mail originates, so it belongs in the same trail as role changes.
  | "GMAIL_OAUTH_CONNECTED"
  | "GMAIL_OAUTH_DISCONNECTED"
  | "EMAIL_TEST_SENT"
  | "CAMPAIGN_CREATED"
  | "CAMPAIGN_UPDATED"
  | "CAMPAIGN_SENT"
  | "CAMPAIGN_CANCELLED";

export async function recordAuditLog({
  userId,
  email,
  action,
  status = "SUCCESS",
  details,
}: {
  userId?: string;
  email: string;
  action: AuditAction;
  status?: "SUCCESS" | "FAILURE";
  details?: Record<string, unknown>;
}) {
  try {
    const headerList = await headers();
    const ipAddress =
      headerList.get("x-forwarded-for")?.split(",")[0] ||
      headerList.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = headerList.get("user-agent") || "Unknown Browser";

    await db.auditLog.create({
      data: {
        userId,
        email,
        action,
        status,
        ipAddress,
        userAgent,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
