import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/business";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin panel, private accounts, auth, and cart/checkout flows carry no search index value.
        disallow: [
          "/admin",
          "/api",
          "/private",
          "/refurbished/cart",
          "/refurbished/checkout",
          "/refurbished/account",
          "/account",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
