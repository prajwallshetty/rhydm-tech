import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/business";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin panel and cart/checkout flows carry no SEO value.
        disallow: ["/admin", "/api", "/refurbished/cart", "/refurbished/checkout"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
