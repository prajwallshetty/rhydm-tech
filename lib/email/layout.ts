import { COMPANY, SITE_URL } from "@/lib/business";

/**
 * Shared email chrome.
 *
 * Email clients are not browsers. Outlook renders through Word, Gmail strips
 * <style> in some contexts, and none of them support flexbox or grid reliably.
 * So: tables for layout, inline CSS, absolute HTTPS image URLs, no JavaScript,
 * and a 600px body — the width every client renders without reflowing.
 */

/** Brand palette, matching the site's primary green. */
export const BRAND = {
  green: "#16A34A",
  greenDark: "#2E6F40",
  ink: "#0F172A",
  body: "#334155",
  muted: "#64748B",
  hairline: "#E2E8F0",
  surface: "#F8FAFC",
  white: "#FFFFFF",
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Absolute origin for every link and image in an email.
 *
 * An email outlives the deploy that sent it. A wrong origin here does not
 * degrade gracefully like a broken page would — it bakes a dead link into a
 * customer's inbox permanently, and there is no way to correct it afterwards.
 * So a localhost origin is a hard error in production rather than something
 * that quietly ships; the failure surfaces in EmailLog and the admin panel.
 */
export function emailOrigin(): string {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL || "").replace(/\/+$/, "");

  if (!origin) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set, so email links would have no origin.",
    );
  }

  if (process.env.NODE_ENV === "production" && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(origin)) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is "${origin}" in production. Every link in every ` +
        "outgoing email would point at localhost and be permanently dead. " +
        "Set it to the real production origin before sending mail.",
    );
  }

  return origin;
}

/** Builds an absolute URL onto the production origin. */
export function emailUrl(path: string): string {
  return `${emailOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Escapes text destined for HTML.
 *
 * Every template runs user-supplied values (names, addresses, product titles)
 * through this. Email clients do render injected markup, so this is a real
 * defence, not a formality.
 */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Formats integer cents as euros, matching the storefront's presentation. */
export function money(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format((cents ?? 0) / 100);
}

/** A primary call-to-action rendered as a bulletproof table button. */
export function button(label: string, href: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td align="center" bgcolor="${BRAND.green}" style="border-radius:10px;">
        <a href="${esc(href)}"
           style="display:inline-block;padding:14px 28px;font-family:${FONT_STACK};font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:10px;">
          ${esc(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

/** A label/value row for order and request summaries. */
export function infoRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:6px 0;font-family:${FONT_STACK};font-size:14px;color:${BRAND.muted};">${esc(label)}</td>
    <td align="right" style="padding:6px 0;font-family:${FONT_STACK};font-size:14px;font-weight:600;color:${BRAND.ink};">${esc(value)}</td>
  </tr>`;
}

export interface LayoutOptions {
  /** Inbox preview line. Shown in the list view before the body is opened. */
  previewText?: string;
  /** Adds an unsubscribe line. Marketing only — never on transactional mail. */
  unsubscribeUrl?: string;
  /** Custom site logo URL */
  logoUrl?: string | null;
}

/**
 * Wraps body HTML in the branded shell.
 *
 * The logo is referenced by absolute HTTPS URL rather than embedded, so the
 * message stays small and Gmail's proxy can cache it.
 */
export function renderLayout(bodyHtml: string, options: LayoutOptions = {}): string {
  const { previewText, unsubscribeUrl, logoUrl } = options;
  const logo = logoUrl || emailUrl("/brand/rhydm-logo.png");
  const year = new Date().getFullYear();

  // Hidden preheader. The trailing entities stop clients from pulling body copy
  // into the preview line after the intended text.
  const preheader = previewText
    ? `<div style="display:none;font-size:1px;color:${BRAND.surface};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(
        previewText,
      )}${"&#847;&zwnj;&nbsp;".repeat(60)}</div>`
    : "";

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(COMPANY.name)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  /* Kept minimal: only the media query, which cannot be inlined. */
  @media only screen and (max-width:620px) {
    .rh-container { width:100% !important; }
    .rh-pad { padding-left:20px !important; padding-right:20px !important; }
    .rh-stack { display:block !important; width:100% !important; }
    .rh-h1 { font-size:22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.surface};">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.surface};">
  <tr>
    <td align="center" style="padding:24px 12px;">

      <table role="presentation" class="rh-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${BRAND.white};border-radius:14px;overflow:hidden;border:1px solid ${BRAND.hairline};">

        <tr>
          <td class="rh-pad" align="left" style="padding:28px 32px 20px;border-bottom:1px solid ${BRAND.hairline};">
            <a href="${emailUrl("/")}" style="text-decoration:none;">
              <img src="${logo}" width="150" height="46" alt="${esc(COMPANY.name)}"
                   style="display:block;border:0;outline:none;width:150px;height:auto;max-width:150px;">
            </a>
          </td>
        </tr>

        <tr>
          <td class="rh-pad" align="left" style="padding:28px 32px 8px;font-family:${FONT_STACK};font-size:15px;line-height:1.6;color:${BRAND.body};">
            ${bodyHtml}
          </td>
        </tr>

        <tr>
          <td class="rh-pad" align="left" style="padding:24px 32px 28px;border-top:1px solid ${BRAND.hairline};background-color:${BRAND.surface};font-family:${FONT_STACK};font-size:12px;line-height:1.7;color:${BRAND.muted};">
            <p style="margin:0 0 6px;font-weight:700;color:${BRAND.ink};">${esc(COMPANY.name)}</p>
            <p style="margin:0 0 2px;">${esc(COMPANY.address.street)}, ${esc(COMPANY.address.postalCode)} ${esc(COMPANY.address.city)}, ${esc(COMPANY.address.country)}</p>
            <p style="margin:0 0 12px;">
              <a href="mailto:${esc(COMPANY.email)}" style="color:${BRAND.greenDark};text-decoration:none;">${esc(COMPANY.email)}</a>
              &nbsp;&middot;&nbsp;
              <a href="tel:${esc(COMPANY.phone)}" style="color:${BRAND.greenDark};text-decoration:none;">${esc(COMPANY.phone)}</a>
            </p>
            <p style="margin:0 0 12px;">
              <a href="${emailUrl("/")}" style="color:${BRAND.greenDark};text-decoration:none;">Website</a>
              &nbsp;&middot;&nbsp;
              <a href="${emailUrl("/en/privacy-policy")}" style="color:${BRAND.greenDark};text-decoration:none;">Privacy Policy</a>
              &nbsp;&middot;&nbsp;
              <a href="${emailUrl("/en/terms-and-conditions")}" style="color:${BRAND.greenDark};text-decoration:none;">Terms</a>
            </p>
            ${
              unsubscribeUrl
                ? `<p style="margin:0 0 8px;">You are receiving this because you opted in to updates from ${esc(
                    COMPANY.name,
                  )}. <a href="${esc(
                    unsubscribeUrl,
                  )}" style="color:${BRAND.greenDark};text-decoration:underline;">Unsubscribe</a>.</p>`
                : ""
            }
            <p style="margin:0;color:#94A3B8;">&copy; ${year} ${esc(COMPANY.name)}. All rights reserved.</p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Heading + paragraph helpers so templates stay declarative. */
export function h1(text: string): string {
  return `<h1 class="rh-h1" style="margin:0 0 14px;font-family:${FONT_STACK};font-size:25px;line-height:1.25;font-weight:800;color:${BRAND.ink};">${esc(
    text,
  )}</h1>`;
}

export function p(html: string): string {
  return `<p style="margin:0 0 14px;font-family:${FONT_STACK};font-size:15px;line-height:1.65;color:${BRAND.body};">${html}</p>`;
}

/** Muted note, e.g. the "ignore this email" line on a password reset. */
export function note(html: string): string {
  return `<p style="margin:0 0 14px;font-family:${FONT_STACK};font-size:13px;line-height:1.6;color:${BRAND.muted};">${html}</p>`;
}

/** Converts a rendered HTML body to a readable plain-text alternative. */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}
