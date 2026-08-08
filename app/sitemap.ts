import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/business";
import { SERVICES } from "@/lib/data/disposal";
import { CATEGORIES } from "@/lib/data/store";
import { NAV } from "@/lib/navigation";
import { db } from "@/lib/db";
import { PublishStatus } from "@/lib/generated/prisma/client";

import { routing } from "@/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  
  // Every public path exists once per locale, cross-linked via hreflang.
  const url = (path: string, locale: string) =>
    `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
  const alternates = (path: string) => ({
    languages: Object.fromEntries(
      routing.locales.map((locale) => [locale, url(path, locale)]),
    ),
  });

  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.9 },
    { path: "/about/yash-saad", priority: 0.7 },
    { path: "/it-asset-disposal-berlin", priority: 0.9 },
    { path: "/blog", priority: 0.8 },
    ...NAV.disposal.map((item) => ({ path: item.href, priority: 0.8 })),
    ...NAV.refurbished.map((item) => ({ path: item.href, priority: 0.8 })),
  ];

  const legalRoutes = [
    "/privacy-policy",
    "/cookie-policy",
    "/terms-and-conditions",
    "/imprint",
    "/refund-policy",
    "/return-policy",
    "/shipping-policy",
    "/withdrawal-policy",
    "/payment-policy",
    "/data-deletion-policy",
    "/security-policy",
    "/accessibility",
    "/sustainability",
    "/compliance",
  ];

  // Fetch all published posts to include in the sitemap index
  const posts = await db.post.findMany({
    where: { status: PublishStatus.PUBLISHED },
    select: { slug: true },
  });

  return routing.locales.flatMap((locale) => [
    ...staticRoutes.map(({ path, priority }) => ({
      url: url(path, locale),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
      alternates: alternates(path),
    })),
    ...posts.map((post) => ({
      url: url(`/blog/${post.slug}`, locale),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: alternates(`/blog/${post.slug}`),
    })),
    ...SERVICES.map((service) => ({
      url: url(`/disposal/services/${service.slug}`, locale),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: alternates(`/disposal/services/${service.slug}`),
    })),
    ...CATEGORIES.map((category) => ({
      url: url(`/refurbished/categories/${category.slug}`, locale),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
      alternates: alternates(`/refurbished/categories/${category.slug}`),
    })),
    ...legalRoutes.map((path) => ({
      url: url(path, locale),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: alternates(path),
    })),
  ]);
}
