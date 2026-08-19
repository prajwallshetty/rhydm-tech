/**
 * Allow-list sanitiser for admin-authored campaign HTML.
 *
 * Admins are trusted, but not unconditionally: an admin account can be phished
 * or shared, and a campaign body is replayed verbatim to thousands of inboxes
 * and rendered in the admin preview pane. A deny-list would need updating every
 * time a new vector appears, so this works the other way round — anything not
 * explicitly permitted is dropped.
 *
 * Runs on save *and* again immediately before send, so a row edited directly in
 * the database still cannot inject script into a campaign.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li",
  "a", "img",
  "table", "thead", "tbody", "tr", "td", "th",
  "div", "span", "blockquote", "hr", "small",
]);

/** Attributes permitted on any allowed tag. */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel", "style"]),
  img: new Set(["src", "alt", "width", "height", "style"]),
  td: new Set(["colspan", "rowspan", "align", "valign", "width", "style"]),
  th: new Set(["colspan", "rowspan", "align", "valign", "width", "style"]),
  table: new Set(["width", "align", "border", "cellpadding", "cellspacing", "style", "role"]),
  "*": new Set(["style", "class", "align"]),
};

/** Blocks javascript:, data: and vbscript: URLs regardless of casing or padding. */
function safeUrl(value: string): string | null {
  const trimmed = value.trim();
  // Strip control characters and spaces: padding a scheme with them
  // is the classic way past a naive check.
  // eslint-disable-next-line no-control-regex
  const normalised = trimmed.replace(/[\u0000-\u0020\u007F]/g, "").toLowerCase();
  if (/^(javascript|vbscript|file|about):/i.test(normalised)) return null;
  // data: URLs are permitted nowhere: they are the classic way to smuggle
  // markup past a naive filter, and no legitimate campaign needs one.
  if (/^data:/i.test(normalised)) return null;
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(normalised)) return trimmed;
  // Anything schemeless is treated as a relative path, which is safe.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(normalised)) return trimmed;
  return null;
}

/** Drops CSS that can execute or load remote code. */
function safeStyle(value: string): string {
  return value
    .split(";")
    .map((decl) => decl.trim())
    .filter((decl) => {
      if (!decl.includes(":")) return false;
      const lower = decl.toLowerCase();
      // expression() is legacy IE script; url() can fetch a remote resource;
      // behavior/binding attach script in older engines.
      return !/(expression\s*\(|javascript:|behavior\s*:|-moz-binding|url\s*\()/i.test(lower);
    })
    .join("; ");
}

/**
 * Returns HTML containing only allow-listed tags and attributes.
 *
 * Implemented as a single tokenising pass rather than a DOM parse so it can run
 * on the server without a DOM implementation dependency.
 */
export function sanitizeEmailHtml(input: string): string {
  if (!input) return "";

  // Remove whole dangerous elements including their content. Done first so
  // their inner text cannot leak through as plain text.
  let html = input
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe\s*>/gi, "")
    .replace(/<object[\s\S]*?<\/object\s*>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/<link[\s\S]*?>/gi, "")
    .replace(/<meta[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  html = html.replace(
    /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*)?)\s*(\/?)>/g,
    (_match, closing: string, rawTag: string, rawAttrs: string, selfClose: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (closing) return `</${tag}>`;

      const allowed = ALLOWED_ATTRS[tag] ?? ALLOWED_ATTRS["*"];
      const globalAllowed = ALLOWED_ATTRS["*"];
      const kept: string[] = [];

      const attrPattern = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
      let m: RegExpExecArray | null;
      while ((m = attrPattern.exec(rawAttrs)) !== null) {
        const name = m[1].toLowerCase();
        const value = m[3] ?? m[4] ?? m[5] ?? "";

        // on* handlers are never allowed, on any tag.
        if (name.startsWith("on")) continue;
        if (!allowed.has(name) && !globalAllowed.has(name)) continue;

        if (name === "href" || name === "src") {
          const url = safeUrl(value);
          if (!url) continue;
          kept.push(`${name}="${url.replaceAll('"', "&quot;")}"`);
          continue;
        }

        if (name === "style") {
          const style = safeStyle(value);
          if (!style) continue;
          kept.push(`style="${style.replaceAll('"', "&quot;")}"`);
          continue;
        }

        kept.push(`${name}="${value.replaceAll('"', "&quot;")}"`);
      }

      // Force external links to open safely; rel=noopener closes the
      // window.opener vector for the webmail clients that honour target.
      if (tag === "a") {
        const hasHref = kept.some((a) => a.startsWith("href="));
        if (!hasHref) return "";
        if (!kept.some((a) => a.startsWith("target="))) kept.push('target="_blank"');
        kept.push('rel="noopener noreferrer"');
      }

      const attrs = kept.length ? ` ${kept.join(" ")}` : "";
      const close = selfClose || tag === "img" || tag === "br" || tag === "hr" ? " /" : "";
      return `<${tag}${attrs}${close}>`;
    },
  );

  return html.trim();
}
