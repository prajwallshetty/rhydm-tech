"use server";

import { db } from "@/lib/db";

/**
 * Unsubscribe handling.
 *
 * Intentionally unauthenticated: an unsubscribe link that demands a login gets
 * ignored, and an ignored unsubscribe becomes a spam complaint. The token is
 * the credential — it is random, single-purpose, and the worst an attacker can
 * do with one is stop mail that the holder was receiving anyway.
 */

export type UnsubscribeResult =
  | { ok: true; email: string; alreadyDone: boolean }
  | { ok: false; error: string };

/** Opts a recipient out by token. */
export async function unsubscribeByToken(token: string): Promise<UnsubscribeResult> {
  const clean = token.trim();
  if (!clean) return { ok: false, error: "This unsubscribe link is missing its token." };

  const user = await db.user.findUnique({
    where: { unsubscribeToken: clean },
    select: { id: true, email: true, marketingConsent: true },
  });

  if (user) {
    if (!user.marketingConsent) {
      return { ok: true, email: user.email, alreadyDone: true };
    }
    await db.user.update({
      where: { id: user.id },
      // The token is kept so a second click on the same link still resolves to
      // a friendly "you are already unsubscribed" rather than an error.
      data: { marketingConsent: false, marketingConsentAt: new Date() },
    });
    return { ok: true, email: user.email, alreadyDone: false };
  }

  const subscriber = await db.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: clean },
    select: { id: true, email: true, consent: true },
  });

  if (subscriber) {
    if (!subscriber.consent) {
      return { ok: true, email: subscriber.email, alreadyDone: true };
    }
    await db.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { consent: false, unsubscribedAt: new Date() },
    });
    return { ok: true, email: subscriber.email, alreadyDone: false };
  }

  return {
    ok: false,
    error: "This unsubscribe link is not valid. It may already have been used or replaced.",
  };
}

/**
 * Opts out by email address, for the manual form.
 *
 * Always reports success. Confirming whether an address is on the list would
 * make this endpoint an enumeration oracle, and the person unsubscribing does
 * not need to know either way.
 */
export async function unsubscribeByEmail(rawEmail: string): Promise<UnsubscribeResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  try {
    await db.user.updateMany({
      where: { email, marketingConsent: true },
      data: { marketingConsent: false, marketingConsentAt: new Date() },
    });
    await db.newsletterSubscriber.updateMany({
      where: { email, consent: true },
      data: { consent: false, unsubscribedAt: new Date() },
    });
  } catch (error) {
    console.error("[unsubscribe] failed:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  return { ok: true, email, alreadyDone: false };
}
