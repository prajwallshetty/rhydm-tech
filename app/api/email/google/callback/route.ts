import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { getAdminSession } from "@/lib/auth/admin";
import { recordAuditLog } from "@/lib/auth/audit";
import { hasPermission } from "@/lib/auth/rbac";
import { storeRefreshToken } from "@/lib/email/credentials";
import {
  exchangeCodeForTokens,
  GMAIL_SEND_SCOPE,
  readGmailConfig,
} from "@/lib/email/oauth";

/**
 * Completes the Gmail sending authorisation.
 *
 * Deliberately NOT under /api/auth/google — that path belongs to visitor login.
 * Keeping them apart means a visitor-login callback can never reach the code
 * that mints a sending token.
 */
export const dynamic = "force-dynamic";

const STATE_COOKIE = "rhydm_gmail_oauth_state";

function settingsRedirect(params: Record<string, string>) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL("/admin/settings/email", base);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin || !hasPermission(admin.role, "SYSTEM_SETTINGS")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const expectedState = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.slice(STATE_COOKIE.length + 1);

  const clearState = (response: NextResponse) => {
    response.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  };

  if (oauthError) {
    return clearState(
      settingsRedirect({ error: `Google returned "${oauthError}". Nothing was changed.` }),
    );
  }

  if (!code || !returnedState || !expectedState) {
    return clearState(
      settingsRedirect({ error: "The authorisation response was incomplete. Please try again." }),
    );
  }

  // Constant-time compare so the check cannot be probed by timing.
  const received = Buffer.from(returnedState);
  const expected = Buffer.from(expectedState);
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    return clearState(
      settingsRedirect({
        error: "Authorisation state did not match. The request was discarded for safety.",
      }),
    );
  }

  let refreshToken: string | null;
  let scope: string | null;
  try {
    ({ refreshToken, scope } = await exchangeCodeForTokens(code));
  } catch (err) {
    return clearState(
      settingsRedirect({ error: err instanceof Error ? err.message : "Token exchange failed." }),
    );
  }

  if (scope && !scope.includes(GMAIL_SEND_SCOPE)) {
    return clearState(
      settingsRedirect({
        error:
          "The granted scope does not include gmail.send. Run the connection again and accept the send permission.",
      }),
    );
  }

  const cfg = readGmailConfig();

  if (!refreshToken) {
    // Google issues a refresh token only on first consent for a given client
    // and user. If one already exists it must be kept, not blanked.
    const alreadyConfigured = Boolean(cfg.refreshToken);
    return clearState(
      settingsRedirect(
        alreadyConfigured
          ? {
              notice:
                "Google did not issue a new refresh token, which means the existing one is still valid. Nothing was changed.",
            }
          : {
              error:
                "Google did not return a refresh token. Remove the app at myaccount.google.com/permissions, then connect again.",
            },
      ),
    );
  }

  if (cfg.refreshToken) {
    // GOOGLE_REFRESH_TOKEN is set explicitly, so it is the operator's stated
    // intent and wins. Overwriting the stored copy would be a no-op at best
    // and a confusing shadow config at worst.
    return clearState(
      settingsRedirect({
        notice:
          "Authorisation succeeded, but GOOGLE_REFRESH_TOKEN is already set in the environment and takes precedence. Nothing was changed.",
      }),
    );
  }

  try {
    // Sealed with AES-256-GCM before it touches the database. It is never
    // written to a URL, a log line or an API response.
    await storeRefreshToken({
      refreshToken,
      senderEmail: cfg.senderEmail ?? "",
      scope,
      connectedById: admin.id,
    });
  } catch (err) {
    return clearState(
      settingsRedirect({
        error:
          err instanceof Error
            ? `Could not store the credential: ${err.message}`
            : "Could not store the credential.",
      }),
    );
  }

  await recordAuditLog({
    userId: admin.id,
    email: admin.email,
    action: "GMAIL_OAUTH_CONNECTED",
    // Records that it happened and which scope — never the token itself.
    details: { scope: scope ?? "unknown", sender: cfg.senderEmail ?? null },
  });

  console.log(`[GMAIL_OAUTH] Connected mailbox: ${cfg.senderEmail ?? "unknown"}`);

  return clearState(settingsRedirect({ connected: "1" }));
}
