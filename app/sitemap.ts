import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/business";
import { SERVICES } from "@/lib/data/disposal";
import { CATEGORIES } from "@/lib/data/store";
import { NAV } from "@/lib/navigation";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${SITE_URL}${path}`;

  const staticRoutes = [
    { path: "/", priority: 1 },
    ...NAV.disposal.map((item) => ({ path: item.href, priority: 0.8 })),
    ...NAV.refurbished.map((item) => ({ path: item.href, priority: 0.8 })),
  ];

  return [
    ...staticRoutes.map(({ path, priority }) => ({
      url: url(path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...SERVICES.map((service) => ({
      url: url(`/disposal/services/${service.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...CATEGORIES.map((category) => ({
      url: url(`/refurbished/categories/${category.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
