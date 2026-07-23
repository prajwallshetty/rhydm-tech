import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/business";
import { SERVICES } from "@/lib/data/disposal";
import { CATEGORIES } from "@/lib/data/store";
import { NAV } from "@/lib/navigation";

import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
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
    ...NAV.disposal.map((item) => ({ path: item.href, priority: 0.8 })),
    ...NAV.refurbished.map((item) => ({ path: item.href, priority: 0.8 })),
  ];

  return routing.locales.flatMap((locale) => [
    ...staticRoutes.map(({ path, priority }) => ({
      url: url(path, locale),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
      alternates: alternates(path),
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
  ]);
}
