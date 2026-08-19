"use server";

import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation/contact";

export type ContactResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** Rate-limit window and ceiling. Generous for a human, hostile to a script. */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;

/**
 * Persists a contact enquiry and alerts the team.
 *
 * The payload is re-validated here even though the client validates too — a
 * Server Action is a public HTTP endpoint and anything arriving at it is
 * untrusted input.
 */
export async function submitContact(values: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, phone, company, topic, message } = parsed.data;

  try {
    // Rate limit on the address rather than the IP: this form is the front door
    // for an ITAD business, so a shared corporate NAT must not lock out a whole
    // office, while a script hammering one address still gets stopped.
    const recent = await db.contactSubmission.count({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - RATE_WINDOW_MS) },
      },
    });

    if (recent >= MAX_PER_WINDOW) {
      return {
        ok: false,
        error:
          "We have already received several enquiries from this address. Please give us a little time to reply before sending another.",
      };
    }

    // Near-identical repeat submissions are almost always a double-click or a
    // retried request, so they are accepted silently rather than duplicated.
    const duplicate = await db.contactSubmission.findFirst({
      where: {
        email,
        message,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
      select: { id: true },
    });
    if (duplicate) return { ok: true };

    const submission = await db.contactSubmission.create({
      data: {
        division: "DISPOSAL",
        name,
        email,
        phone: phone || null,
        company: company || null,
        topic,
        message,
      },
    });

    // Email is best-effort: the enquiry is already saved and visible in the
    // admin panel, so a mailbox problem must not show the customer an error.
    const { EmailService } = await import("@/lib/email/service");

    try {
      const notified = await EmailService.sendContactNotification({
        name,
        email,
        phone: phone || null,
        company: company || null,
        topic: topic ?? null,
        message,
        submittedAt: submission.createdAt,
      });

      if (notified.ok) {
        await db.contactSubmission.update({
          where: { id: submission.id },
          data: { notificationSentAt: new Date() },
        });
      }
    } catch (error) {
      console.error("[contact] admin notification failed:", error);
    }

    try {
      await EmailService.sendContactAcknowledgement({ to: email, name });
    } catch (error) {
      console.error("[contact] acknowledgement failed:", error);
    }

    return { ok: true };
  } catch (error) {
    // Never surface database internals to the browser.
    console.error("submitContact failed:", error);
    return {
      ok: false,
      error: "Something went wrong saving your enquiry. Please try again.",
    };
  }
}
