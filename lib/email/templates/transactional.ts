import { COMPANY } from "@/lib/business";
import {
  BRAND,
  button,
  emailUrl,
  esc,
  h1,
  htmlToText,
  infoRow,
  money,
  note,
  p,
  renderLayout,
} from "@/lib/email/layout";

/** Every template returns exactly this: the transport needs both parts. */
export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// ---------------------------------------------------------------------------
// Order confirmation
// ---------------------------------------------------------------------------

export interface OrderEmailItem {
  name: string;
  sku: string;
  quantity: number;
  priceCents: number;
  imageUrl?: string | null;
}

export interface OrderEmailInput {
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  email: string;
  items: OrderEmailItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  discountCents?: number;
  totalCents: number;
  paymentStatus: string;
  paymentMethod: string | null;
  shippingAddress: {
    fullName?: string;
    line1?: string;
    line2?: string | null;
    city?: string;
    postalCode?: string;
    country?: string;
  } | null;
  /** Signed URL to the customer's order page. */
  orderUrl: string;
}

function orderItemRow(item: OrderEmailItem): string {
  const rawUrl = item.imageUrl || "/brand/rhydm-mark.png";
  const imageUrl = rawUrl.startsWith("http") ? rawUrl : emailUrl(rawUrl);

  const thumb = `<img src="${esc(imageUrl)}" width="56" height="56" alt="${esc(item.name)}"
         style="display:block;width:56px;height:56px;border-radius:8px;border:1px solid ${BRAND.hairline};object-fit:cover;">`;

  return `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid ${BRAND.hairline};" valign="top" width="72">${thumb}</td>
    <td style="padding:12px 0;border-bottom:1px solid ${BRAND.hairline};font-family:${FONT};" valign="top">
      <div style="font-size:14px;font-weight:700;color:${BRAND.ink};">${esc(item.name)}</div>
      <div style="font-size:12px;color:${BRAND.muted};margin-top:2px;">SKU ${esc(item.sku)} &middot; Qty ${item.quantity}</div>
    </td>
    <td align="right" style="padding:12px 0;border-bottom:1px solid ${BRAND.hairline};font-family:${FONT};font-size:14px;font-weight:700;color:${BRAND.ink};white-space:nowrap;" valign="top">
      ${esc(money(item.priceCents * item.quantity))}
    </td>
  </tr>`;
}

export function renderOrderConfirmation(input: OrderEmailInput): RenderedEmail {
  const addr = input.shippingAddress;
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(input.orderDate);

  const totalsRows = [
    infoRow("Subtotal", money(input.subtotalCents)),
    infoRow("Shipping", input.shippingCents === 0 ? "Free" : money(input.shippingCents)),
    input.taxCents > 0 ? infoRow("VAT included", money(input.taxCents)) : "",
    input.discountCents && input.discountCents > 0
      ? infoRow("Discount", `-${money(input.discountCents)}`)
      : "",
  ].join("");

  const body = `
    ${h1("Thank you for your order.")}
    ${p(`Hello ${esc(input.customerName)}, we have received your order and payment. Here is a summary for your records.`)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:20px 0;background:${BRAND.surface};border:1px solid ${BRAND.hairline};border-radius:10px;">
      <tr><td style="padding:16px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${infoRow("Order number", input.orderNumber)}
          ${infoRow("Order date", dateLabel)}
          ${infoRow("Payment", `${input.paymentMethod ?? "Card"} — ${input.paymentStatus}`)}
        </table>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${input.items.map(orderItemRow).join("")}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
      ${totalsRows}
      <tr>
        <td style="padding:12px 0 0;border-top:2px solid ${BRAND.ink};font-family:${FONT};font-size:16px;font-weight:800;color:${BRAND.ink};">Total</td>
        <td align="right" style="padding:12px 0 0;border-top:2px solid ${BRAND.ink};font-family:${FONT};font-size:16px;font-weight:800;color:${BRAND.ink};">${esc(
          money(input.totalCents),
        )}</td>
      </tr>
    </table>

    ${button("View order", input.orderUrl)}

    ${
      addr
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
             <tr><td style="font-family:${FONT};font-size:13px;line-height:1.6;color:${BRAND.body};">
               <strong style="color:${BRAND.ink};">Shipping to</strong><br>
               ${esc(addr.fullName ?? input.customerName)}<br>
               ${esc(addr.line1 ?? "")}${addr.line2 ? `<br>${esc(addr.line2)}` : ""}<br>
               ${esc(addr.postalCode ?? "")} ${esc(addr.city ?? "")}<br>
               ${esc(addr.country ?? "")}
             </td></tr>
           </table>`
        : ""
    }

    ${note(
      `We will email you again as soon as your order ships. Questions? Reply to this email or contact us at <a href="mailto:${esc(
        COMPANY.email,
      )}" style="color:${BRAND.greenDark};">${esc(COMPANY.email)}</a>.`,
    )}
  `;

  const html = renderLayout(body, {
    previewText: `Order ${input.orderNumber} confirmed — ${money(input.totalCents)}`,
  });

  return {
    subject: `Order Confirmed — ${COMPANY.name} #${input.orderNumber}`,
    html,
    text: htmlToText(body),
  };
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export function renderPasswordReset(input: {
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}): RenderedEmail {
  const body = `
    ${h1("Reset your password")}
    ${p(`Hello ${esc(input.name)},`)}
    ${p(`We received a request to reset the password on your ${esc(COMPANY.name)} account. Click the button below to choose a new one.`)}
    ${button("Reset password", input.resetUrl)}
    ${note(`This link expires in ${input.expiresInMinutes} minutes and can only be used once.`)}
    ${note("If you did not request a password reset, you can safely ignore this email — your password will not change.")}
  `;

  return {
    subject: `Reset Your ${COMPANY.name} Password`,
    html: renderLayout(body, { previewText: "Your password reset link" }),
    // The URL is deliberately included in the text part too: it is the same
    // secret the button carries, and text-only clients need a usable link.
    text: `${htmlToText(body)}\n\nReset link: ${input.resetUrl}`,
  };
}

// ---------------------------------------------------------------------------
// Exchange / trade-in
// ---------------------------------------------------------------------------

/**
 * Customer acknowledgement.
 *
 * Contains no number by design: Rhydm prices every device by hand after review,
 * so quoting any figure here would be a promise the business has not made.
 */
export function renderExchangeReceived(input: {
  name: string;
  referenceNumber: string;
  device: string;
}): RenderedEmail {
  const body = `
    ${h1("Your trade-in request has been received.")}
    ${p(`Hello ${esc(input.name)}, thank you for sending us the details of your ${esc(input.device)}.`)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:18px 0;background:${BRAND.surface};border:1px solid ${BRAND.hairline};border-radius:10px;">
      <tr><td style="padding:16px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${infoRow("Reference", input.referenceNumber)}
          ${infoRow("Device", input.device)}
        </table>
      </td></tr>
    </table>

    ${p("Our team will review your device details and photos and contact you with an offer. There is no obligation to accept.")}
    ${note(`Please quote reference ${esc(input.referenceNumber)} in any correspondence.`)}
  `;

  return {
    subject: `Trade-in request received — ${input.referenceNumber}`,
    html: renderLayout(body, { previewText: "We have your device details" }),
    text: htmlToText(body),
  };
}

/** Admin-facing notification. Carries everything needed to start the review. */
export function renderExchangeAdminNotification(input: {
  referenceNumber: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  deviceType: string;
  brand: string;
  model: string;
  configuration: string;
  condition: string;
  description: string | null;
  images: string[];
  submittedAt: Date;
  adminUrl: string;
}): RenderedEmail {
  const photos = input.images.length
    ? input.images
        .map(
          (url, i) =>
            `<a href="${esc(url)}" style="color:${BRAND.greenDark};font-size:13px;">Photo ${i + 1}</a>`,
        )
        .join(" &middot; ")
    : "<span style=\"color:#94A3B8;font-size:13px;\">No photos supplied</span>";

  const body = `
    ${h1(`New exchange request — ${input.referenceNumber}`)}
    ${p("A customer has submitted a device for trade-in. Review the details and photos, then record an offer in the admin panel.")}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:18px 0;background:${BRAND.surface};border:1px solid ${BRAND.hairline};border-radius:10px;">
      <tr><td style="padding:16px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${infoRow("Customer", input.contactName ?? "—")}
          ${infoRow("Email", input.contactEmail ?? "—")}
          ${infoRow("Phone", input.contactPhone ?? "—")}
          ${infoRow("Device", `${input.deviceType} — ${input.brand} ${input.model}`)}
          ${infoRow("Configuration", input.configuration)}
          ${infoRow("Condition", input.condition)}
          ${infoRow("Submitted", input.submittedAt.toISOString().replace("T", " ").slice(0, 16))}
        </table>
      </td></tr>
    </table>

    ${input.description ? p(`<strong style="color:${BRAND.ink};">Customer notes:</strong><br>${esc(input.description)}`) : ""}
    ${p(`<strong style="color:${BRAND.ink};">Photos:</strong><br>${photos}`)}

    ${button("Open in admin", input.adminUrl)}
  `;

  return {
    subject: `New Exchange Request — #${input.referenceNumber}`,
    html: renderLayout(body, { previewText: `${input.brand} ${input.model} submitted for review` }),
    text: htmlToText(body),
  };
}

// ---------------------------------------------------------------------------
// Contact form
// ---------------------------------------------------------------------------

export function renderContactNotification(input: {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  topic: string | null;
  message: string;
  submittedAt: Date;
}): RenderedEmail {
  const body = `
    ${h1("New contact request")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:18px 0;background:${BRAND.surface};border:1px solid ${BRAND.hairline};border-radius:10px;">
      <tr><td style="padding:16px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${infoRow("Name", input.name)}
          ${infoRow("Email", input.email)}
          ${infoRow("Phone", input.phone ?? "—")}
          ${infoRow("Company", input.company ?? "—")}
          ${infoRow("Topic", input.topic ?? "—")}
          ${infoRow("Received", input.submittedAt.toISOString().replace("T", " ").slice(0, 16))}
        </table>
      </td></tr>
    </table>
    ${p(`<strong style="color:${BRAND.ink};">Message</strong><br>${esc(input.message).replace(/\n/g, "<br>")}`)}
    ${button("Reply to customer", `mailto:${input.email}`)}
  `;

  return {
    subject: `New Contact Request — ${COMPANY.name}`,
    html: renderLayout(body, { previewText: `${input.name}: ${input.message.slice(0, 80)}` }),
    text: htmlToText(body),
  };
}

/** Optional acknowledgement to the person who filled in the form. */
export function renderContactAcknowledgement(input: { name: string }): RenderedEmail {
  const body = `
    ${h1("Thanks for getting in touch.")}
    ${p(`Hello ${esc(input.name)}, we have received your enquiry and a member of our team will reply shortly.`)}
    ${p("Our office hours are Monday to Friday, 09:00–17:00 CET.")}
    ${note(`If your enquiry is urgent, call us on <a href="tel:${esc(COMPANY.phone)}" style="color:${BRAND.greenDark};">${esc(COMPANY.phone)}</a>.`)}
  `;

  return {
    subject: `We received your enquiry — ${COMPANY.name}`,
    html: renderLayout(body, { previewText: "We will be in touch shortly" }),
    text: htmlToText(body),
  };
}

// ---------------------------------------------------------------------------
// Generic admin alert + connection test
// ---------------------------------------------------------------------------

export function renderAdminNotification(input: {
  title: string;
  lines: Array<[string, string]>;
  ctaLabel?: string;
  ctaUrl?: string;
  intro?: string;
}): RenderedEmail {
  const body = `
    ${h1(input.title)}
    ${input.intro ? p(esc(input.intro)) : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:18px 0;background:${BRAND.surface};border:1px solid ${BRAND.hairline};border-radius:10px;">
      <tr><td style="padding:16px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${input.lines.map(([k, v]) => infoRow(k, v)).join("")}
        </table>
      </td></tr>
    </table>
    ${input.ctaLabel && input.ctaUrl ? button(input.ctaLabel, input.ctaUrl) : ""}
  `;

  return {
    subject: `${input.title} — ${COMPANY.name}`,
    html: renderLayout(body, { previewText: input.intro ?? input.title }),
    text: htmlToText(body),
  };
}

export function renderTestEmail(input: { senderEmail: string; triggeredBy: string }): RenderedEmail {
  const body = `
    ${h1("Email Configuration Test")}
    ${p(`This is a test email from the ${esc(COMPANY.name)} website.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:18px 0;background:${BRAND.surface};border:1px solid ${BRAND.hairline};border-radius:10px;">
      <tr><td style="padding:16px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${infoRow("Sending as", input.senderEmail)}
          ${infoRow("Requested by", input.triggeredBy)}
          ${infoRow("Sent at", new Date().toISOString().replace("T", " ").slice(0, 19))}
        </table>
      </td></tr>
    </table>
    ${button("Open the website", emailUrl("/"))}
  `;

  return {
    subject: `${COMPANY.name} — Email Configuration Test`,
    html: renderLayout(body, { previewText: "This is a test email from the website." }),
    text: htmlToText(body),
  };
}
