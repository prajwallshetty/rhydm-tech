import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/business";
import { SERVICES } from "@/lib/data/disposal";
import { CATEGORIES } from "@/lib/data/store";
import { NAV } from "@/lib/navigation";
import { NON_INDEXABLE_PATHS } from "@/lib/seo/crawl";
import { db } from "@/lib/db";
import { PublishStatus } from "@/lib/generated/prisma/client";

import { routing } from "@/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  
  // Every public path exists once per locale, cross-linked via hreflang.
  const url = (path: string, locale: string) =>
    `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
  // x-default must be advertised alongside the per-locale URLs, otherwise a
  // visitor outside DE/EN has no declared fallback and the two locales risk
  // being read as unrelated pages rather than translations of one another.
  const alternates = (path: string) => ({
    languages: {
      ...Object.fromEntries(
        routing.locales.map((locale) => [locale, url(path, locale)]),
      ),
      "x-default": url(path, routing.defaultLocale),
    },
  });

  /**
   * A sitemap must list only indexable URLs. Including one that is blocked or
   * carries `noindex` is a Search Console error, so both exclusion lists are
   * applied from the single source in lib/seo/crawl.ts.
   */
  const isIndexable = (path: string) =>
    !NON_INDEXABLE_PATHS.some(
      (blocked) => path === blocked || path.startsWith(`${blocked}/`),
    );

  const staticRoutes = [
    { path: "/", priority: 1 },
    // The brand entity page — the target for "Rhydm Tech" / "Rhydm" queries.
    { path: "/rhydm-tech", priority: 0.9 },
    { path: "/about", priority: 0.9 },
    { path: "/about/yash-saad", priority: 0.7 },
    { path: "/it-asset-disposal-berlin", priority: 0.9 },
    { path: "/blog", priority: 0.8 },
    ...NAV.disposal.map((item) => ({ path: item.href, priority: 0.8 })),
    ...NAV.refurbished.map((item) => ({ path: item.href, priority: 0.8 })),
  ].filter((route) => isIndexable(route.path));

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

  const storeRoutes = [
    { path: "/refurbished/shop", priority: 0.8 },
    { path: "/refurbished/categories", priority: 0.8 },
    { path: "/refurbished/brands", priority: 0.8 },
    { path: "/refurbished/deals", priority: 0.8 },
    { path: "/refurbished/exchange", priority: 0.8 },
    { path: "/refurbished/trade-in", priority: 0.8 },
    { path: "/refurbished/sell-your-device", priority: 0.8 },
    { path: "/refurbished/support", priority: 0.7 },
  ].filter((route) => isIndexable(route.path));

  // Fetch all published posts
  const posts = await db.post.findMany({
    where: { status: PublishStatus.PUBLISHED },
    select: { slug: true, updatedAt: true },
  });

  // Published only. Product.status defaults to DRAFT, so an unfiltered query
  // advertised unreleased products to Google as indexable URLs.
  const products = await db.product.findMany({
    where: { status: PublishStatus.PUBLISHED },
    select: { slug: true, updatedAt: true },
  });

  // Fetch all brands
  const brands = await db.brand.findMany({
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
    ...storeRoutes.map(({ path, priority }) => ({
      url: url(path, locale),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority,
      alternates: alternates(path),
    })),
    ...posts.map((post) => ({
      url: url(`/blog/${post.slug}`, locale),
      lastModified: post.updatedAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: alternates(`/blog/${post.slug}`),
    })),
    ...products.map((product) => ({
      url: url(`/refurbished/products/${product.slug}`, locale),
      lastModified: product.updatedAt || now,
      changeFrequency: "daily" as const,
      priority: 0.8,
      alternates: alternates(`/refurbished/products/${product.slug}`),
    })),
    ...brands.map((brand) => ({
      url: url(`/refurbished/brands/${brand.slug}`, locale),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: alternates(`/refurbished/brands/${brand.slug}`),
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
