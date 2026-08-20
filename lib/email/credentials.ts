import "server-only";

import crypto from "node:crypto";

import { db } from "@/lib/db";

/**
 * Encrypted at-rest storage for the Gmail refresh token.
 *
 * The token is a long-lived credential to the company mailbox: anyone holding
 * it can send mail as Rhydm indefinitely. It therefore never appears in a URL,
 * a log line, an API response, or a database column in plaintext.
 *
 * Precedence is env first, database second. That keeps a pure 12-factor
 * deployment possible (set GOOGLE_REFRESH_TOKEN and this table is never
 * touched) while still letting an admin connect the mailbox from the UI on a
 * host where changing env vars needs a redeploy.
 */

const RECORD_ID = "gmail";
const ALGORITHM = "aes-256-gcm";

/**
 * Derives the encryption key from the app secret.
 *
 * scrypt rather than a raw hash so a weak AUTH_SECRET is expensive to brute
 * force. The salt is fixed and non-secret: it exists to domain-separate this
 * key from any other use of the same secret, not to add entropy.
 */
function encryptionKey(): Buffer {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    "rhydm-tech-enterprise-secret-key-2026";
  return crypto.scryptSync(secret, "rhydm-email-credential-v1", 32);
}

/** Seals a token. Returns the three parts GCM needs to open it again. */
export function sealToken(plaintext: string): {
  ciphertext: string;
  iv: string;
  authTag: string;
} {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    // The auth tag is what makes this tamper-evident: a modified ciphertext
    // fails to open rather than decrypting to attacker-chosen bytes.
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

/** Opens a sealed token, or returns null if the key changed or bytes were altered. */
export function openToken(sealed: {
  ciphertext: string;
  iv: string;
  authTag: string;
}): string | null {
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      encryptionKey(),
      Buffer.from(sealed.iv, "base64"),
    );
    decipher.setAuthTag(Buffer.from(sealed.authTag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(sealed.ciphertext, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // Rotating AUTH_SECRET invalidates every stored token. That is the correct
    // outcome — reconnect the mailbox rather than silently using stale state.
    return null;
  }
}

/** Persists a newly issued refresh token, replacing any previous one. */
export async function storeRefreshToken(input: {
  refreshToken: string;
  senderEmail: string;
  scope: string | null;
  connectedById: string | null;
}): Promise<void> {
  const sealed = sealToken(input.refreshToken);
  await db.emailCredential.upsert({
    where: { id: RECORD_ID },
    create: {
      id: RECORD_ID,
      ...sealed,
      senderEmail: input.senderEmail,
      scope: input.scope,
      connectedById: input.connectedById,
    },
    update: {
      ...sealed,
      senderEmail: input.senderEmail,
      scope: input.scope,
      connectedById: input.connectedById,
    },
  });
}

/**
 * Returns the stored token, or null when there is none.
 *
 * A record issued for a different mailbox is ignored: if GOOGLE_EMAIL changed,
 * the old token authorises the wrong account and must not be used.
 */
export async function loadStoredRefreshToken(
  expectedSender: string | null,
): Promise<string | null> {
  let record;
  try {
    record = await db.emailCredential.findUnique({ where: { id: RECORD_ID } });
  } catch {
    // Table absent (migration not yet applied) is not an error worth throwing.
    return null;
  }
  if (!record) return null;
  if (expectedSender && record.senderEmail !== expectedSender) return null;

  return openToken(record);
}

/** Connection metadata for the admin page. Never includes the token. */
export async function describeStoredCredential(): Promise<{
  present: boolean;
  senderEmail: string | null;
  scope: string | null;
  connectedAt: Date | null;
} | null> {
  try {
    const record = await db.emailCredential.findUnique({
      where: { id: RECORD_ID },
      select: { senderEmail: true, scope: true, connectedAt: true },
    });
    if (!record) return { present: false, senderEmail: null, scope: null, connectedAt: null };
    return {
      present: true,
      senderEmail: record.senderEmail,
      scope: record.scope,
      connectedAt: record.connectedAt,
    };
  } catch {
    return null;
  }
}

/** Removes the stored token. Used by "Disconnect". */
export async function clearStoredRefreshToken(): Promise<void> {
  await db.emailCredential.deleteMany({ where: { id: RECORD_ID } });
}
