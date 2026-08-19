import "server-only";

import { COMPANY } from "@/lib/business";
import { emailUrl } from "@/lib/email/layout";
import { EmailService } from "@/lib/email/service";
import {
  BRAND,
  button,
  esc,
  h1,
  htmlToText,
  infoRow,
  note,
  p,
  renderLayout,
} from "@/lib/email/layout";

/**
 * Exchange notifications.
 *
 * These were previously mock functions that wrote to the console and delivered
 * nothing. They now delegate to the Gmail-backed EmailService, keeping their
 * original signatures so every existing call site works unchanged.
 */

/** Kept for callers that still import it. Prefer EmailService directly. */
export async function sendNotificationEmail(to: string, subject: string, htmlContent: string) {
  return EmailService.sendEmail({
    to,
    rendered: {
      subject,
      html: renderLayout(htmlContent),
      text: htmlToText(htmlContent),
    },
  });
}

/**
 * Tells the customer their request moved to a new stage.
 *
 * `details` is caller-supplied and may quote an amount, but never carries the
 * admin's internal notes — the admin action decides what is safe to forward.
 */
export async function notifyCustomerStatusChange(
  email: string,
  referenceNumber: string,
  newStatus: string,
  details?: string,
) {
  const body = `
    ${h1("Trade-in update")}
    ${p("Hello,")}
    ${p(`The status of your trade-in request <strong>${esc(referenceNumber)}</strong> is now <strong>${esc(newStatus)}</strong>.`)}
    ${details ? p(esc(details)) : ""}
    ${button("View your request", emailUrl("/en/refurbished/account"))}
    ${note(`Questions? Reply to this email or contact us at <a href="mailto:${esc(COMPANY.email)}" style="color:${BRAND.greenDark};">${esc(COMPANY.email)}</a>.`)}
  `;

  return EmailService.sendEmail({
    to: email,
    rendered: {
      subject: `Trade-in request ${referenceNumber}: status update`,
      html: renderLayout(body, { previewText: `Now ${newStatus}` }),
      text: htmlToText(body),
    },
  });
}

/** Alerts the team that a new device is waiting to be priced. */
export async function notifyAdminNewRequest(referenceNumber: string, deviceName: string) {
  return EmailService.sendAdminNotification({
    title: `New trade-in request ${referenceNumber}`,
    intro: "A new device has been submitted and is waiting for manual review.",
    lines: [
      ["Reference", referenceNumber],
      ["Device", deviceName],
    ],
    ctaLabel: "Review in admin",
    ctaUrl: emailUrl("/admin/exchanges"),
  });
}

/**
 * Tells the customer an offer has been made.
 *
 * Only ever called after an admin records an amount by hand. There is no
 * automatic valuation for this to announce.
 */
export async function notifyCustomerCounterOffer(
  email: string,
  referenceNumber: string,
  amountCents: number,
) {
  const amount = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amountCents / 100);

  const body = `
    ${h1("Your trade-in offer")}
    ${p("Hello,")}
    ${p(`Our team has reviewed the details and photos for trade-in request <strong>${esc(referenceNumber)}</strong>.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:18px 0;background:${BRAND.surface};border:1px solid ${BRAND.hairline};border-radius:10px;">
      <tr><td style="padding:16px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${infoRow("Reference", referenceNumber)}
          ${infoRow("Our offer", amount)}
        </table>
      </td></tr>
    </table>
    ${p("The offer is subject to a final inspection once we receive the device. You can accept or decline from your account — there is no obligation either way.")}
    ${button("Review the offer", emailUrl("/en/refurbished/account"))}
  `;

  return EmailService.sendEmail({
    to: email,
    rendered: {
      subject: `Trade-in request ${referenceNumber}: your offer`,
      html: renderLayout(body, { previewText: `We can offer ${amount}` }),
      text: htmlToText(body),
    },
  });
}
