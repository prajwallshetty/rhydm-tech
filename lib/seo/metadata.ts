/**
 * Reusable metadata generators.
 *
 * Every page calls one of these instead of manually assembling Metadata
 * objects. This guarantees consistent canonicals, hreflang alternates, OG
 * tags and Twitter cards across the site.
 */

import type { Metadata } from "next";

import { COMPANY, SITE_URL } from "@/lib/business";
import { routing } from "@/i18n/routing";
import { KEYWORDS_GLOBAL, VERIFICATION } from "./constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Absolute URL from a locale and path. */
function localeUrl(locale: string, path: string): string {
  const clean = path === "/" ? "" : path;
  return `${SITE_URL}/${locale}${clean}`;
}

/** hreflang alternates for a given path (without locale prefix). */
function alternatesForPath(path: string) {
  return {
    canonical: path,
    languages: Object.fromEntries(
      routing.locales.map((locale) => [locale, localeUrl(locale, path)]),
    ),
  };
}

// ---------------------------------------------------------------------------
// Core metadata factory
// ---------------------------------------------------------------------------

export type PageMetadataOptions = {
  /** Page title (without the site-name suffix — the template adds it). */
  title: string;
  /** Meta description. Should be unique and 120-160 chars. */
  description: string;
  /** Path without locale prefix, e.g. "/disposal/services". */
  path: string;
  /** Extra keywords merged with global defaults. */
  keywords?: string[];
  /** OG type — defaults to "website". */
  ogType?: "website" | "article" | "product";
  /** OG image URL (absolute). Falls back to generated OG image. */
  ogImage?: string;
  /** Whether search engines should index this page. Defaults to true. */
  index?: boolean;
  /** Whether search engines should follow links. Defaults to true. */
  follow?: boolean;
  /** Optional article metadata for blog posts. */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
  };
};

export function createPageMetadata(opts: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    keywords = [],
    ogType = "website",
    ogImage,
    index = true,
    follow = true,
    article,
  } = opts;

  const mergedKeywords = [
    ...new Set([...keywords, ...KEYWORDS_GLOBAL]),
  ];

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: alternatesForPath(path),
    robots: { index, follow },
    openGraph: {
      title,
      description,
      url: path,
      siteName: COMPANY.name,
      type: ogType as "website",
      locale: "en_US",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
      ...(article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
            tags: article.tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    verification: {
      google: VERIFICATION.google,
      ...(VERIFICATION.bing ? { other: { "msvalidate.01": VERIFICATION.bing } } : {}),
      ...(VERIFICATION.yandex ? { yandex: VERIFICATION.yandex } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Shorthand for product pages
// ---------------------------------------------------------------------------

export type ProductMetadataInput = {
  name: string;
  slug: string;
  description?: string | null;
  brandName?: string | null;
  categoryName?: string;
  priceCents: number;
  condition: string;
  images?: { url: string; alt?: string | null }[];
};

export function createProductMetadata(
  product: ProductMetadataInput,
): Metadata {
  const title = product.brandName
    ? `${product.name} — ${product.brandName} | Certified Refurbished`
    : `${product.name} | Certified Refurbished`;

  const description =
    product.description ??
    `Buy certified refurbished ${product.name}${product.brandName ? ` by ${product.brandName}` : ""} — tested, graded and warranty-backed by ${COMPANY.name}.`;

  const path = `/refurbished/products/${product.slug}`;

  const keywords = [
    product.name,
    ...(product.brandName ? [`${product.brandName} refurbished`] : []),
    ...(product.categoryName
      ? [`refurbished ${product.categoryName}`]
      : []),
    `${product.condition} refurbished`,
  ];

  return createPageMetadata({
    title,
    description: description.slice(0, 160),
    path,
    keywords,
    ogType: "product",
    ogImage: product.images?.[0]?.url,
  });
}

// ---------------------------------------------------------------------------
// Shorthand for service detail pages
// ---------------------------------------------------------------------------

export function createServiceMetadata(service: {
  title: string;
  slug: string;
  summary: string;
}): Metadata {
  return createPageMetadata({
    title: `${service.title} — Rhydm Tech ITAD`,
    description: service.summary.slice(0, 160),
    path: `/disposal/services/${service.slug}`,
    keywords: [
      service.title,
      "IT Asset Disposal",
      "ITAD",
      "Rhydm Tech",
    ],
  });
}
