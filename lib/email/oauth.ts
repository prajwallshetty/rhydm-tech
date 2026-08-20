import "server-only";

import { SITE_URL } from "@/lib/business";

/**
 * Gmail sending OAuth — deliberately separate from lib/auth/google.ts.
 *
 * Two different things share the name "Google OAuth" in this codebase:
 *
 *   lib/auth/google.ts   "Sign in with Google" — a *visitor* authorises us to
 *                        read their profile. Runs per visitor, no stored token.
 *   this file            "Send as Rhydm" — the *company* authorises the server
 *                        to send mail from its own mailbox. Runs once, and the
 *                        resulting refresh token lives in the server env.
 *
 * They may share one Google Cloud OAuth client (a client can hold several
 * redirect URIs), but the flows, scopes and tokens must never mix: a visitor
 * login must never mint a sending token, and the sending token must never
 * authenticate a visitor. Separate modules make that hard to get wrong.
 */

/** The only scope requested. gmail.send cannot read, list or delete mail. */
export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

/** Refresh slightly early so a token cannot expire mid-flight. */
const EXPIRY_SKEW_MS = 60_000;

export interface GmailOAuthConfig {
  clientId: string;
  clientSecret: string;
  senderEmail: string;
  refreshToken: string;
}

/** Thrown when the mailbox is not connected. Terminal — retrying will not help. */
export class EmailConfigError extends Error {
  readonly terminal = true;
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigError";
  }
}

/** Thrown when Google rejects the credentials. Also terminal. */
export class EmailAuthError extends Error {
  readonly terminal = true;
  constructor(message: string) {
    super(message);
    this.name = "EmailAuthError";
  }
}

/** Reads config from the environment. Never import this into a client module. */
export function readGmailConfig(): Partial<GmailOAuthConfig> {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID?.trim() || undefined,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || undefined,
    senderEmail: process.env.GOOGLE_EMAIL?.trim() || undefined,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN?.trim() || undefined,
  };
}

export type GmailConfigProblem =
  | "MISSING_CLIENT_ID"
  | "MISSING_CLIENT_SECRET"
  | "MISSING_SENDER"
  | "MISSING_REFRESH_TOKEN";

/**
 * What is missing, if anything.
 *
 * Returns booleans and the sender address only — the admin page renders setup
 * state from this and therefore never has a secret value in scope.
 */
export async function inspectGmailConfig(): Promise<{
  configured: boolean;
  problems: GmailConfigProblem[];
  senderEmail: string | null;
  /** True when the token came from the encrypted store rather than the env. */
  tokenFromStore: boolean;
}> {
  const cfg = readGmailConfig();
  const refreshToken = await resolveRefreshToken();

  const problems: GmailConfigProblem[] = [];
  if (!cfg.clientId) problems.push("MISSING_CLIENT_ID");
  if (!cfg.clientSecret) problems.push("MISSING_CLIENT_SECRET");
  if (!cfg.senderEmail) problems.push("MISSING_SENDER");
  if (!refreshToken) problems.push("MISSING_REFRESH_TOKEN");

  return {
    configured: problems.length === 0,
    problems,
    // Not a secret: it appears in the From: header of every message we send.
    senderEmail: cfg.senderEmail ?? null,
    tokenFromStore: Boolean(refreshToken) && !cfg.refreshToken,
  };
}

/**
 * Resolves the refresh token, preferring the environment.
 *
 * An explicitly configured env var is the operator's stated intent and must
 * win; the encrypted database record exists only so the mailbox can be
 * connected from the UI on hosts where changing env requires a redeploy.
 * This ordering is also what satisfies "do not overwrite an existing
 * GOOGLE_REFRESH_TOKEN" — a stored token can never shadow one that is set.
 */
export async function resolveRefreshToken(): Promise<string | null> {
  const cfg = readGmailConfig();
  if (cfg.refreshToken) return cfg.refreshToken;

  const { loadStoredRefreshToken } = await import("@/lib/email/credentials");
  return loadStoredRefreshToken(cfg.senderEmail ?? null);
}

async function requireConfig(): Promise<GmailOAuthConfig> {
  const cfg = readGmailConfig();
  const refreshToken = await resolveRefreshToken();

  if (!cfg.clientId || !cfg.clientSecret || !cfg.senderEmail || !refreshToken) {
    throw new EmailConfigError(
      "Gmail sending is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET " +
        "and GOOGLE_EMAIL, then connect the mailbox from Admin -> Settings -> Email.",
    );
  }
  return { ...cfg, refreshToken } as GmailOAuthConfig;
}

/**
 * Process-wide access-token cache.
 *
 * Access tokens last about an hour. Caching means a burst of sends performs one
 * refresh rather than one per message. Keyed by refresh token so rotating the
 * env var invalidates the cache without needing a restart.
 */
interface CachedToken {
  accessToken: string;
  expiresAt: number;
  refreshTokenKey: string;
}

const globalForToken = globalThis as unknown as {
  __rhydmGmailToken?: CachedToken;
  __rhydmGmailInflight?: Promise<string>;
};

/**
 * Returns a valid access token, refreshing through the refresh token when the
 * cached one is missing or close to expiry.
 *
 * Concurrent callers share a single in-flight refresh. Without that, a 50
 * message batch on a cold start would fire 50 simultaneous refreshes and get
 * rate-limited by Google.
 */
export async function getAccessToken(): Promise<string> {
  const cfg = await requireConfig();
  const cached = globalForToken.__rhydmGmailToken;

  if (
    cached &&
    cached.refreshTokenKey === cfg.refreshToken &&
    Date.now() < cached.expiresAt - EXPIRY_SKEW_MS
  ) {
    return cached.accessToken;
  }

  if (globalForToken.__rhydmGmailInflight) {
    return globalForToken.__rhydmGmailInflight;
  }

  const inflight = refreshAccessToken(cfg)
    .then((token) => {
      globalForToken.__rhydmGmailInflight = undefined;
      return token;
    })
    .catch((err: unknown) => {
      globalForToken.__rhydmGmailInflight = undefined;
      throw err;
    });

  globalForToken.__rhydmGmailInflight = inflight;
  return inflight;
}

async function refreshAccessToken(cfg: GmailOAuthConfig): Promise<string> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  const payload = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!res.ok || !payload.access_token) {
    // Google's error *code* is safe to surface. No value from `cfg` is
    // interpolated into this message, so no secret can reach a log or a page.
    const code = payload.error ?? `http_${res.status}`;
    console.error(`[GMAIL_OAUTH] Token refresh failed: ${code}`);
    if (code === "invalid_grant") {
      throw new EmailAuthError(
        "Google rejected the stored refresh token (invalid_grant). It was revoked, " +
          "expired, or belongs to a different OAuth client. Reconnect from " +
          "Admin -> Settings -> Email to mint a new one.",
      );
    }
    throw new EmailAuthError(`Could not obtain a Gmail access token (${code}).`);
  }

  console.log("[GMAIL_OAUTH] Token refresh successful");
  const expiresInMs = (payload.expires_in ?? 3600) * 1000;
  globalForToken.__rhydmGmailToken = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + expiresInMs,
    refreshTokenKey: cfg.refreshToken,
  };

  return payload.access_token;
}

/** Drops the cached token so the next send re-refreshes. Used after a 401. */
export function invalidateAccessToken() {
  globalForToken.__rhydmGmailToken = undefined;
}

/** Absolute callback URL. Must match a redirect URI registered in Google Cloud. */
export function getGmailRedirectUri(): string {
  const base = SITE_URL.replace(/\/+$/, "");
  return `${base}/api/email/google/callback`;
}

/**
 * Consent URL for the one-time connection.
 *
 * access_type=offline together with prompt=consent is what makes Google return
 * a refresh token. Without both, a re-authorisation yields only an access token
 * and the mailbox silently stops sending an hour later.
 */
export function buildGmailConsentUrl(state: string): string {
  const cfg = readGmailConfig();
  if (!cfg.clientId) {
    throw new EmailConfigError("GOOGLE_CLIENT_ID is not set.");
  }

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: getGmailRedirectUri(),
    response_type: "code",
    scope: GMAIL_SEND_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "false",
    state,
  });
  if (cfg.senderEmail) params.set("login_hint", cfg.senderEmail);

  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

/** Exchanges the one-time authorisation code for tokens. */
export async function exchangeCodeForTokens(code: string): Promise<{
  refreshToken: string | null;
  scope: string | null;
}> {
  const cfg = readGmailConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new EmailConfigError("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set.");
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: getGmailRedirectUri(),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  const payload = (await res.json().catch(() => ({}))) as {
    refresh_token?: string;
    scope?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new EmailAuthError(`Token exchange failed (${payload.error ?? res.status}).`);
  }

  return { refreshToken: payload.refresh_token ?? null, scope: payload.scope ?? null };
}
