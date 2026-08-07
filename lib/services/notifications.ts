/**
 * Mock email and notification service.
 * Logs notifications to console/logs and serves as an integration point for actual email systems.
 */
export async function sendNotificationEmail(to: string, subject: string, htmlContent: string) {
  console.log(`[MOCK EMAIL SENT]
==================================================
TO: ${to}
SUBJECT: ${subject}
BODY:
${htmlContent.replace(/<[^>]*>/g, " ")} // Strip HTML for console logging
==================================================`);
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
 * Notifies the customer of a counter-offer.
 */
export async function notifyCustomerCounterOffer(
  email: string,
  referenceNumber: string,
  amountCents: number
) {
  const amountEUR = (amountCents / 100).toFixed(2);
  const subject = `Trade-in Request ${referenceNumber}: Counter Offer Received`;
  const htmlContent = `
    <h1>Counter Offer Received</h1>
    <p>Dear Customer,</p>
    <p>We have completed the inspection for your device under trade-in request <strong>${referenceNumber}</strong>.</p>
    <p>We would like to present a counter offer of <strong>€${amountEUR}</strong> based on the condition of the hardware.</p>
    <p>Please log in to your account dashboard to either <strong>Accept</strong> or <strong>Reject</strong> this offer.</p>
    <p>Best regards,<br/>Rhydm Technologies Team</p>
  `;

  await sendNotificationEmail(email, subject, htmlContent);
}
