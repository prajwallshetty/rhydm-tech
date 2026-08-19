import {
  BRAND,
  emailUrl,
  esc,
  htmlToText,
  money,
  renderLayout,
} from "@/lib/email/layout";
import { sanitizeEmailHtml } from "@/lib/email/sanitize";
import type { RenderedEmail } from "@/lib/email/templates/transactional";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export interface MarketingProductCard {
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string | null;
  /** Short factual description. Never generated or embellished here. */
  summary: string | null;
}

export interface MarketingEmailInput {
  subject: string;
  previewText: string | null;
  /** Admin-authored HTML. Sanitised again here regardless of what the caller did. */
  bodyHtml: string;
  bodyText?: string | null;
  products: MarketingProductCard[];
  unsubscribeUrl: string;
  recipientName?: string | null;
}

/**
 * Product card.
 *
 * Renders only stored values — name, price, image, description. Nothing about
 * stock, urgency or savings is synthesised: a claim in a marketing email is a
 * statement the business is legally accountable for, so this template can only
 * repeat facts the catalogue already holds.
 */
function productCard(product: MarketingProductCard): string {
  const url = emailUrl(`/en/refurbished/products/${product.slug}`);
  const image = product.imageUrl
    ? `<img src="${esc(product.imageUrl)}" width="536" alt=""
           style="display:block;width:100%;max-width:536px;height:auto;border-radius:10px 10px 0 0;border:0;">`
    : "";

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="margin:0 0 16px;border:1px solid ${BRAND.hairline};border-radius:12px;overflow:hidden;background:${BRAND.white};">
    ${image ? `<tr><td>${image}</td></tr>` : ""}
    <tr>
      <td style="padding:16px 18px;font-family:${FONT};">
        <div style="font-size:16px;font-weight:800;color:${BRAND.ink};margin-bottom:4px;">${esc(product.name)}</div>
        ${
          product.summary
            ? `<div style="font-size:13px;line-height:1.55;color:${BRAND.muted};margin-bottom:10px;">${esc(product.summary)}</div>`
            : ""
        }
        <div style="font-size:18px;font-weight:800;color:${BRAND.greenDark};margin-bottom:12px;">${esc(money(product.priceCents))}</div>
        <a href="${esc(url)}"
           style="display:inline-block;padding:10px 20px;background:${BRAND.green};color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;">
          View product
        </a>
      </td>
    </tr>
  </table>`;
}

export function renderMarketingEmail(input: MarketingEmailInput): RenderedEmail {
  // Sanitise at render time as well as at save time. This is the last point
  // before the HTML reaches an inbox, so it is the one that actually matters.
  const safeBody = sanitizeEmailHtml(input.bodyHtml);

  const greeting = input.recipientName
    ? `<p style="margin:0 0 14px;font-family:${FONT};font-size:15px;color:${BRAND.body};">Hello ${esc(
        input.recipientName,
      )},</p>`
    : "";

  const productsHtml = input.products.length
    ? `<div style="margin-top:22px;">${input.products.map(productCard).join("")}</div>`
    : "";

  const body = `${greeting}
    <div style="font-family:${FONT};font-size:15px;line-height:1.65;color:${BRAND.body};">
      ${safeBody}
    </div>
    ${productsHtml}`;

  const html = renderLayout(body, {
    previewText: input.previewText ?? undefined,
    unsubscribeUrl: input.unsubscribeUrl,
  });

  const text =
    (input.bodyText && input.bodyText.trim()) ||
    `${htmlToText(body)}\n\n---\nUnsubscribe: ${input.unsubscribeUrl}`;

  return { subject: input.subject, html, text };
}
