/**
 * Reusable metadata generators.
 *
 * Every page calls one of these instead of manually assembling Metadata
 * objects. This guarantees consistent canonicals, hreflang alternates, OG
 * tags and Twitter cards across the site.
 */

import type { Metadata } from "next";

import { BRAND, COMPANY, SITE_URL } from "@/lib/business";
import { routing } from "@/i18n/routing";
import { KEYWORDS_GLOBAL, VERIFICATION } from "./constants";
import { OG_IMAGE } from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Absolute URL from a locale and path. */
function localeUrl(locale: string, path: string): string {
  const clean = path === "/" ? "" : path;
  return `${SITE_URL}/${locale}${clean}`;
}

/**
 * Canonical + hreflang alternates for a page.
 *
 * The canonical MUST carry the locale prefix. Returning the bare `path` made
 * every locale of a page emit the same canonical — `/en/about` and `/de/about`
 * both declared `https://rhydm-tech.com/about` — which tells Google the German
 * page is a duplicate of a URL that is not even in the hreflang set, and that
 * the canonical target 307-redirects. Self-referencing, locale-prefixed, and
 * identical to the matching hreflang entry is the only correct form.
 *
 * `x-default` is required, not optional: with only `en` and `de` declared,
 * a visitor from any third country has no advertised fallback and Google is
 * free to pick — or to treat the two as unrelated pages. It points at the
 * default locale.
 */
function alternatesForPath(path: string, locale: string) {
  return {
    canonical: localeUrl(locale, path),
    languages: {
      ...Object.fromEntries(
        routing.locales.map((locale) => [locale, localeUrl(locale, path)]),
      ),
      "x-default": localeUrl(routing.defaultLocale, path),
    },
  };
}

// ---------------------------------------------------------------------------
// Core metadata factory
// ---------------------------------------------------------------------------

export type PageMetadataOptions = {
  /** Locale of the page being rendered. Drives the canonical URL. */
  locale: string;
  /** Page title (without the site-name suffix — the template adds it). */
  title: string;
  /** Force the title to be absolute (bypasses template suffix). */
  absoluteTitle?: boolean;
  /** Meta description. Should be unique and 120-160 chars. */
  description: string;
  /** Path without locale prefix, e.g. "/disposal/services". */
  path: string;
  /** Extra keywords merged with global defaults. */
  keywords?: string[];
  /**
   * OG type — defaults to "website".
   *
   * Deliberately excludes "product": the Open Graph protocol has it, but
   * Next's metadata API rejects it at render time ("Invalid OpenGraph type"),
   * and it was previously smuggled past TypeScript with a cast that only
   * surfaced as a prerender failure. Google reads product facts from the
   * Product JSON-LD on the page, not from og:type, so nothing is lost.
   */
  ogType?: "website" | "article";
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
    locale,
    title,
    absoluteTitle = false,
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

  // Every page shares one brand sharing image unless it has a better one of
  // its own, so a link to any page previews as Rhydm Tech rather than blank.
  const image = ogImage ?? `${SITE_URL}${OG_IMAGE.path}`;
  const imageAlt = ogImage ? title : `${BRAND} — ${COMPANY.legalName}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: mergedKeywords,
    alternates: alternatesForPath(path, locale),
    robots: { index, follow },
    openGraph: {
      title,
      description,
      url: localeUrl(locale, path),
      // The brand, not the legal entity — this is the string social platforms
      // print above the card, and it must read "Rhydm Tech".
      siteName: BRAND,
      type: ogType,
      // og:locale must match the page, not be hardcoded to en_US, or every
      // German page advertises itself to scrapers as English.
      locale: locale === "de" ? "de_DE" : "en_US",
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => (l === "de" ? "de_DE" : "en_US")),
      images: [
        { url: image, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: imageAlt },
      ],
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
      images: [image],
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
  locale: string;
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
    locale: product.locale,
    title,
    description: description.slice(0, 160),
    path,
    keywords,
    ogImage: product.images?.[0]?.url,
  });
}

// ---------------------------------------------------------------------------
// Shorthand for service detail pages
// ---------------------------------------------------------------------------

export function createServiceMetadata(
  service: { title: string; slug: string; summary: string },
  locale: string,
): Metadata {
  return createPageMetadata({
    locale,
    title: `${service.title} — ${BRAND} ITAD`,
    description: service.summary.slice(0, 160),
    path: `/disposal/services/${service.slug}`,
    keywords: [
      service.title,
      "IT Asset Disposal",
      "ITAD",
      BRAND,
      COMPANY.legalName,
    ],
  });
}

// ---------------------------------------------------------------------------
// Private pages
// ---------------------------------------------------------------------------

/**
 * Metadata for a page that must stay out of the index but remain crawlable.
 *
 * `follow` is kept on so link equity still flows through to the public pages
 * these link to, and no canonical is declared — a cart or account page is not
 * a duplicate of anything and should simply drop out of the index.
 */
export function noindexMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
  };
}
