/**
 * Notification service.
 *
 * ⚠️ NO EMAIL PROVIDER IS WIRED UP. Every call below writes to the server log
 * and nothing reaches the recipient. This is the single integration point —
 * swap the body of `sendNotificationEmail` for a real provider (Resend,
 * Postmark, SES, …) and every notification starts delivering.
 *
 * Until then the trade-in workflow depends on an admin watching
 * /admin/exchanges, and customers are told only that the team will be in
 * touch — no message promises an email that would never arrive.
 */
export async function sendNotificationEmail(to: string, subject: string, htmlContent: string) {
  const body = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // warn, not log: in production this is a dropped message, not a debug line.
  console.warn(
    `[notifications] NOT DELIVERED (no email provider configured) — to=${to} subject=${subject}`,
  );
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[notifications] body: ${body}`);
  }
}

/**
 * Notifies the customer of an status change.
 */
export async function notifyCustomerStatusChange(
  email: string,
  referenceNumber: string,
  newStatus: string,
  details?: string
) {
  const subject = `Trade-in Request ${referenceNumber}: Status Update`;
  const htmlContent = `
    <h1>Trade-in Update</h1>
    <p>Dear Customer,</p>
    <p>The status of your trade-in request <strong>${referenceNumber}</strong> has been updated to: <strong>${newStatus}</strong>.</p>
    ${details ? `<p>Details: ${details}</p>` : ""}
    <p>Please log in to your dashboard to view details, track progress, or submit required details.</p>
    <p>Best regards,<br/>Rhydm Technologies Team</p>
  `;

  await sendNotificationEmail(email, subject, htmlContent);
}

/**
 * Notifies the administrators of a new exchange request submission.
 */
export async function notifyAdminNewRequest(referenceNumber: string, deviceName: string) {
  const subject = `New Trade-in Request: ${referenceNumber}`;
  const htmlContent = `
    <h1>New Trade-in Request Submitted</h1>
    <p>A new trade-in request has been submitted for evaluation.</p>
    <p><strong>Reference Number:</strong> ${referenceNumber}</p>
    <p><strong>Device:</strong> ${deviceName}</p>
    <p>Please review this request in the admin panel.</p>
  `;

  // Standard support / admin email group
  await sendNotificationEmail("admin@rhydm.tech", subject, htmlContent);
}

/**
 * Notifies the customer that a specialist has made them an offer.
 *
 * Only ever called after an admin records an offer by hand — there is no
 * automatic valuation to announce.
 */
export async function notifyCustomerCounterOffer(
  email: string,
  referenceNumber: string,
  amountCents: number
) {
  const amountEUR = (amountCents / 100).toFixed(2);
  const subject = `Trade-in request ${referenceNumber}: your offer`;
  const htmlContent = `
    <h1>Your trade-in offer</h1>
    <p>Dear Customer,</p>
    <p>Our team has reviewed the details and photos for trade-in request <strong>${referenceNumber}</strong>.</p>
    <p>We can offer <strong>€${amountEUR}</strong> for your device, subject to a final inspection once we receive it.</p>
    <p>Please log in to your account dashboard to <strong>accept</strong> or <strong>decline</strong> this offer. There is no obligation either way.</p>
    <p>Best regards,<br/>Rhydm Technologies Team</p>
  `;

  await sendNotificationEmail(email, subject, htmlContent);
}
