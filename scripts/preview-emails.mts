/**
 * Renders every email template to HTML files you can open in a browser.
 *
 * Email is the one surface with no dev server and no hot reload — you cannot
 * see a template without sending it somewhere. This renders all of them with
 * representative data and asserts the properties that actually break in real
 * clients: a missing doctype, a relative URL that resolves to nothing in an
 * inbox, an unclosed table that collapses the layout in Outlook, a localhost
 * link baked in from a dev environment.
 *
 * Usage:  npx tsx --conditions=react-server scripts/preview-emails.mts
 * Output: email-previews/*.html  (gitignored)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

// Force the production origin: .env.local points at localhost for dev, and a
// preview rendered with localhost links tells you nothing about the real mail.
process.env.NEXT_PUBLIC_SITE_URL = process.env.EMAIL_PREVIEW_ORIGIN || "https://rhydm-tech.com";

import fs from "node:fs";
import path from "node:path";

import {
  renderContactAcknowledgement,
  renderContactNotification,
  renderExchangeAdminNotification,
  renderExchangeReceived,
  renderOrderConfirmation,
  renderPasswordReset,
  renderTestEmail,
  type RenderedEmail,
} from "../lib/email/templates/transactional";
import { renderMarketingEmail } from "../lib/email/templates/marketing";

const OUT_DIR = "email-previews";
fs.mkdirSync(OUT_DIR, { recursive: true });

const samples: Record<string, RenderedEmail> = {
  "order-confirmation": renderOrderConfirmation({
    orderNumber: "RH-2026-A1B2C3",
    orderDate: new Date(),
    customerName: "Anna Müller",
    email: "anna@example.com",
    items: [
      { name: 'Dell Latitude 7420 — 14" i7', sku: "DL-7420-I7", quantity: 1, priceCents: 74900, imageUrl: null },
      { name: "HP EliteBook 840 G8", sku: "HP-840-G8", quantity: 2, priceCents: 61900, imageUrl: null },
    ],
    subtotalCents: 198700,
    shippingCents: 0,
    taxCents: 31727,
    totalCents: 198700,
    paymentStatus: "COMPLETED",
    paymentMethod: "PayPal",
    shippingAddress: {
      fullName: "Anna Müller",
      line1: "Gartenfelder Str. 29",
      city: "Berlin",
      postalCode: "13599",
      country: "Germany",
    },
    orderUrl: "https://rhydm-tech.com/en/refurbished/account/orders/RH-2026-A1B2C3",
  }),

  "password-reset": renderPasswordReset({
    name: "Anna",
    resetUrl: "https://rhydm-tech.com/reset-password?token=EXAMPLE",
    expiresInMinutes: 60,
  }),

  "exchange-received": renderExchangeReceived({
    name: "Anna",
    referenceNumber: "EXCH-706281",
    device: "Dell Latitude 7420",
  }),

  "exchange-admin": renderExchangeAdminNotification({
    referenceNumber: "EXCH-706281",
    contactName: "Anna Müller",
    contactEmail: "anna@example.com",
    contactPhone: "+49 30 123456",
    deviceType: "Laptop",
    brand: "Dell",
    model: "Latitude 7420",
    configuration: "Intel Core i7 / 16GB / 512GB SSD",
    condition: "Good",
    description: "Small scratch on the lid, otherwise excellent.",
    images: ["https://res.cloudinary.com/demo/image/upload/a.jpg"],
    submittedAt: new Date(),
    adminUrl: "https://rhydm-tech.com/admin/exchanges/example",
  }),

  "contact-notification": renderContactNotification({
    name: "Anna Müller",
    email: "anna@example.com",
    phone: "+49 30 123456",
    company: "Beispiel GmbH",
    topic: "pickup",
    message: "We have 40 laptops to dispose of.\nCan you collect next week?",
    submittedAt: new Date(),
  }),

  "contact-acknowledgement": renderContactAcknowledgement({ name: "Anna" }),

  test: renderTestEmail({
    senderEmail: "website@rhydm-tech.com",
    triggeredBy: "admin@rhydm-tech.com",
  }),

  marketing: renderMarketingEmail({
    subject: "New refurbished laptops available",
    previewText: "Fresh stock, certified and warrantied",
    bodyHtml:
      "<p>We have just added a new batch of business laptops.</p>" +
      "<p><strong>All units</strong> are certified and come with a 12-month warranty.</p>",
    bodyText: null,
    products: [
      {
        name: "Dell Latitude 7420",
        slug: "dell-latitude-7420",
        priceCents: 74900,
        imageUrl: null,
        summary: 'Intel Core i7, 16GB RAM, 512GB SSD, 14" FHD',
      },
    ],
    unsubscribeUrl: "https://rhydm-tech.com/unsubscribe?token=EXAMPLE",
    recipientName: "Anna",
  }),
};

/** The failure modes that only show up in a real mail client. */
function lint(html: string, text: string): string[] {
  const problems: string[] = [];
  if (!html.includes("<!doctype html>")) problems.push("no doctype");
  if (!html.includes("max-width:600px")) problems.push("missing 600px cap");
  if (!html.includes("@media only screen")) problems.push("no responsive media query");
  if (/<script/i.test(html)) problems.push("CONTAINS SCRIPT");
  if (/(?:src|href)="\/(?!\/)/.test(html)) problems.push("relative URL (dead in an inbox)");
  if (html.includes("localhost")) problems.push("LOCALHOST URL");
  if (!text || text.length < 20) problems.push("plain-text part too short");

  const opens = (html.match(/<table/g) ?? []).length;
  const closes = (html.match(/<\/table>/g) ?? []).length;
  if (opens !== closes) problems.push(`unbalanced table tags (${opens} open, ${closes} close)`);

  return problems;
}

let failures = 0;
for (const [name, mail] of Object.entries(samples)) {
  fs.writeFileSync(path.join(OUT_DIR, `${name}.html`), mail.html);
  const problems = lint(mail.html, mail.text);

  if (problems.length) {
    failures += 1;
    console.log(`FAIL  ${name.padEnd(24)} ${problems.join(", ")}`);
  } else {
    console.log(
      `ok    ${name.padEnd(24)} ${(mail.html.length / 1024).toFixed(1)} KB — "${mail.subject}"`,
    );
  }
}

console.log(
  `\n${Object.keys(samples).length} templates rendered to ${OUT_DIR}/ — ${failures} with issues`,
);
process.exit(failures === 0 ? 0 : 1);
