import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/business";
import { DISALLOWED_PATHS } from "@/lib/seo/crawl";
import { routing } from "@/i18n/routing";

/**
 * Private paths exist at `/en/...` and `/de/...` as well as unprefixed, so each
 * rule is emitted once per locale plus once bare. Disallowing only `/admin`
 * would leave `/de/admin` crawlable.
 *
 * Note this covers only DISALLOWED_PATHS. Account, cart and auth pages are
 * deliberately left crawlable so the `noindex` they serve is actually read —
 * see the comment in lib/seo/crawl.ts.
 */
function localizedDisallows(): string[] {
  return DISALLOWED_PATHS.flatMap((path) => [
    path,
    ...routing.locales.map((locale) => `/${locale}${path}`),
  ]);
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin panel, private accounts, auth, and cart/checkout flows
        // carry no search index value.
        disallow: localizedDisallows(),
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
