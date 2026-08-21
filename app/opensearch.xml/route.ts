import { BRAND, COMPANY, SITE_URL } from "@/lib/business";
import { routing } from "@/i18n/routing";

/**
 * OpenSearch description document.
 *
 * Every page's `<head>` links to `/opensearch.xml`, which previously 404'd —
 * browsers fetched it on each navigation and got nothing back. It points at
 * the storefront search so the browser can offer "search Rhydm Tech" directly
 * from the address bar.
 */
export const dynamic = "force-static";

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const searchUrl = `${SITE_URL}/${routing.defaultLocale}/refurbished/search?q={searchTerms}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${xmlEscape(BRAND)}</ShortName>
  <Description>${xmlEscape(`Search refurbished IT equipment at ${BRAND} (${COMPANY.legalName})`)}</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="96" height="96" type="image/png">${xmlEscape(`${SITE_URL}/favicon/favicon-96x96.png`)}</Image>
  <Url type="text/html" method="get" template="${xmlEscape(searchUrl)}" />
  <moz:SearchForm xmlns:moz="http://www.mozilla.org/2006/browser/search/">${xmlEscape(`${SITE_URL}/${routing.defaultLocale}/refurbished/search`)}</moz:SearchForm>
</OpenSearchDescription>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/opensearchdescription+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
