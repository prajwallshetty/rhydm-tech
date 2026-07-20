"use server";

import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation/contact";

export type ContactResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Persists a contact enquiry.
 *
 * The payload is re-validated here even though the client validates too — a
 * Server Action is a public HTTP endpoint and anything arriving at it is
 * untrusted input.
 */
export async function submitContact(
  values: unknown,
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const { name, email, phone, company, topic, message } = parsed.data;

  try {
    await db.contactSubmission.create({
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
