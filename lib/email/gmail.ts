import "server-only";

import { COMPANY } from "@/lib/business";
import {
  EmailAuthError,
  EmailConfigError,
  getAccessToken,
  invalidateAccessToken,
  readGmailConfig,
} from "@/lib/email/oauth";

/**
 * Gmail API transport.
 *
 * Uses the REST endpoint directly rather than nodemailer + googleapis. Those
 * two packages would add several megabytes and a transitive dependency tree to
 * ship what is, at this level, one authenticated POST of a MIME string. The
 * project has no other mail dependency, so keeping it to fetch also keeps the
 * bundle and the audit surface small.
 */

const SEND_ENDPOINT =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

export interface SendMessageInput {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative. Always send one: text-only clients and spam filters both want it. */
  text: string;
  replyTo?: string;
  /** Rendered as a List-Unsubscribe header so Gmail shows its native unsubscribe control. */
  listUnsubscribeUrl?: string;
}

export interface SendMessageResult {
  messageId: string | null;
}

/** Non-terminal: the network or Google hiccuped and a retry may well succeed. */
export class EmailTransientError extends Error {
  readonly terminal = false;
  constructor(message: string) {
    super(message);
    this.name = "EmailTransientError";
  }
}

/** Terminal: the address itself is unusable, so retrying can never succeed. */
export class EmailPermanentError extends Error {
  readonly terminal = true;
  constructor(message: string) {
    super(message);
    this.name = "EmailPermanentError";
  }
}

/**
 * RFC 2047 encoded-word for header values.
 *
 * Subjects legitimately contain non-ASCII — German umlauts, the euro sign, a
 * customer's name. Raw UTF-8 in a header is not valid and arrives as mojibake,
 * so anything outside printable ASCII is base64-encoded.
 */
function encodeHeaderValue(value: string): string {
  const cleaned = value.replace(/[\r\n]+/g, " ").trim();
  // eslint-disable-next-line no-control-regex
  if (/^[\x20-\x7E]*$/.test(cleaned)) return cleaned;
  return `=?UTF-8?B?${Buffer.from(cleaned, "utf8").toString("base64")}?=`;
}

/**
 * Formats a display name + address pair.
 *
 * The name is encoded rather than quoted so a comma or non-ASCII character in
 * the company name cannot split the header into two addresses.
 */
function formatAddress(name: string, email: string): string {
  return `${encodeHeaderValue(name)} <${email}>`;
}

/**
 * Strips anything that could inject an extra header.
 *
 * A recipient address is frequently attacker-controlled (a signup form). A CR
 * or LF in it would let the sender append their own Bcc: line, turning our
 * mailbox into an open relay.
 */
function sanitiseAddress(value: string): string {
  const cleaned = value.replace(/[\r\n\0]/g, "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleaned)) {
    throw new EmailPermanentError(`Refusing to send to a malformed address.`);
  }
  return cleaned;
}

/** Quoted-printable-free body encoding: base64 sidesteps line-length limits entirely. */
function base64Body(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/(.{76})/g, "$1\r\n");
}

/**
 * Builds a multipart/alternative MIME message.
 *
 * Both parts are always present. Gmail and Outlook pick the HTML part; plain
 * text serves accessibility clients, text-only readers, and reduces the odds of
 * a spam classification.
 */
export function buildMimeMessage(
  input: SendMessageInput,
  from: { name: string; email: string },
): string {
  const to = sanitiseAddress(input.to);
  const boundary = `rhydm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  const headers = [
    `From: ${formatAddress(from.name, from.email)}`,
    `To: ${to}`,
    `Subject: ${encodeHeaderValue(input.subject)}`,
    "MIME-Version: 1.0",
    `Date: ${new Date().toUTCString()}`,
  ];

  if (input.replyTo) {
    headers.push(`Reply-To: ${sanitiseAddress(input.replyTo)}`);
  }

  if (input.listUnsubscribeUrl) {
    // Gmail and Outlook surface a native unsubscribe button from these two
    // headers, which materially reduces spam reports on marketing sends.
    headers.push(`List-Unsubscribe: <${input.listUnsubscribeUrl}>`);
    headers.push("List-Unsubscribe-Post: List-Unsubscribe=One-Click");
  }

  headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);

  return [
    headers.join("\r\n"),
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64Body(input.text),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64Body(input.html),
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

/**
 * Sends one message through the connected Gmail mailbox.
 *
 * A 401 is retried exactly once with a fresh access token: the cached token can
 * be revoked mid-flight, and that single retry turns an otherwise-lost message
 * into a delivered one.
 */
export async function sendRawMessage(
  input: SendMessageInput,
): Promise<SendMessageResult> {
  const cfg = readGmailConfig();
  if (!cfg.senderEmail) {
    throw new EmailConfigError("GOOGLE_EMAIL is not set, so there is no From address.");
  }

  const mime = buildMimeMessage(input, {
    name: process.env.EMAIL_FROM_NAME?.trim() || COMPANY.name,
    email: cfg.senderEmail,
  });
  const raw = Buffer.from(mime, "utf8").toString("base64url");

  const attempt = async (token: string) =>
    fetch(SEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
      cache: "no-store",
    });

  let res: Response;
  try {
    res = await attempt(await getAccessToken());
    if (res.status === 401) {
      invalidateAccessToken();
      res = await attempt(await getAccessToken());
    }
  } catch (err) {
    if (err instanceof EmailAuthError || err instanceof EmailConfigError) throw err;
    throw new EmailTransientError(
      `Could not reach the Gmail API: ${err instanceof Error ? err.message : "network error"}`,
    );
  }

  if (res.ok) {
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    return { messageId: body.id ?? null };
  }

  const body = (await res.json().catch(() => ({}))) as {
    error?: { message?: string; status?: string };
  };
  const detail = body.error?.message ?? `HTTP ${res.status}`;

  if (res.status === 401 || res.status === 403) {
    throw new EmailAuthError(`Gmail rejected the credentials: ${detail}`);
  }
  // 429 and 5xx are worth another go; 400-class is the caller's fault.
  if (res.status === 429 || res.status >= 500) {
    throw new EmailTransientError(`Gmail is temporarily unavailable: ${detail}`);
  }
  throw new EmailPermanentError(`Gmail refused the message: ${detail}`);
}
