import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { getAdminSession } from "@/lib/auth/admin";
import { hasPermission } from "@/lib/auth/rbac";
import { buildGmailConsentUrl, EmailConfigError } from "@/lib/email/oauth";
import { SITE_URL } from "@/lib/business";

/**
 * Starts the one-time Gmail sending authorisation.
 *
 * Admin-only. Anyone who can reach this route can bind the site's outbound mail
 * to a mailbox they control, so it is gated on the same permission as the rest
 * of system settings and never exposed in the storefront.
 */
export const dynamic = "force-dynamic";

const STATE_COOKIE = "rhydm_gmail_oauth_state";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin || !hasPermission(admin.role, "SYSTEM_SETTINGS")) {
    // 404 rather than 403: an unauthenticated prober learns nothing about
    // whether this route exists.
    return new NextResponse("Not found", { status: 404 });
  }

  let consentUrl: string;
  const state = crypto.randomBytes(32).toString("base64url");

  try {
    consentUrl = buildGmailConsentUrl(state);
  } catch (err) {
    if (err instanceof EmailConfigError) {
      return NextResponse.redirect(
        new URL(
          `/admin/settings/email?error=${encodeURIComponent(err.message)}`,
          SITE_URL,
        ),
      );
    }
    throw err;
  }

  const response = NextResponse.redirect(consentUrl);

  // The state is echoed back by Google and compared on return. Without it, an
  // attacker could feed the admin a callback URL bearing *their* auth code and
  // silently repoint the site's outbound mail at their own mailbox.
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
