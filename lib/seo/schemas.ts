/**
 * JSON-LD structured data generators.
 *
 * Each function returns a plain object ready to be serialised via the
 * `<JsonLd>` component. The `@context` is included by the component, so
 * generators only produce the body.
 */

import { BRAND, COMPANY, SITE_URL, type Division } from "@/lib/business";
import {
  GEO,
  OPENING_HOURS_SPECIFICATION,
  SOCIAL_PROFILES,
} from "./constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * The single canonical logo. One stable, crawlable URL — duplicates under other
 * paths split the logo signal. Dimensions are the file's real intrinsic size;
 * Google discards a logo whose declared size does not match the asset.
 */
export const LOGO = {
  path: "/brand/rhydm-logo.png",
  width: 1200,
  height: 370,
  alt: `${BRAND} logo`,
} as const;

/** 1200x630 sharing image used for Open Graph and Twitter cards. */
export const OG_IMAGE = {
  path: "/brand/rhydm-tech-og.png",
  width: 1200,
  height: 630,
} as const;

/** Absolute URL from a path, for origin-level resources (logo, assets). */
function abs(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Absolute URL of a *page*, including its locale prefix.
 *
 * Every public page lives under `/en` or `/de`, so a schema URL built without
 * the prefix names a URL that redirects and does not match the page's own
 * canonical. Google reconciles `@id`, `offers.url` and breadcrumb items
 * against the canonical, so these have to agree exactly.
 */
function pageUrl(locale: string, path: string): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}/${locale}${clean}`;
}

// ---------------------------------------------------------------------------
// Organization (appears on every page via the root layout)
// ---------------------------------------------------------------------------

export function organizationSchema() {
  const url = `${SITE_URL}/`;
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    // Registered entity is the `name`; the brand people actually search for is
    // the first `alternateName`. Keeping "Rhydm" in the list is what tells
    // Google the bare token is this entity and not a misspelling of "rhythm".
    name: COMPANY.legalName,
    legalName: COMPANY.legalName,
    alternateName: [BRAND, "Rhydm", "Rhydm-Tech"],
    // Explicit brand node so "Rhydm Tech" resolves as a Brand owned by
    // Rhydm Technologies rather than as a second, competing organisation.
    brand: {
      "@type": "Brand",
      "@id": `${SITE_URL}/#brand`,
      name: BRAND,
      alternateName: COMPANY.legalName,
      url: `${SITE_URL}/rhydm-tech`,
      logo: abs(LOGO.path),
    },
    url: url,
    logo: {
      "@type": "ImageObject",
      url: abs(LOGO.path),
      width: LOGO.width,
      height: LOGO.height,
      caption: BRAND,
    },
    image: abs(LOGO.path),
    description: COMPANY.description,
    email: COMPANY.email,
    telephone: COMPANY.phoneE164,
    foundingDate: COMPANY.foundingDate,
    address: postalAddressSchema(),
    contactPoint: contactPointSchema(),
    geo: geoCoordinatesSchema(),
    areaServed: [
      { "@type": "Country", name: "Germany" },
      { "@type": "Place", name: "Berlin" },
    ],
    knowsAbout: [
      "IT Asset Disposal",
      "IT Asset Disposition (ITAD)",
      "Secure Data Destruction",
      "IT Equipment Recycling",
      "E-Waste Recycling",
      "Refurbished Electronics",
      "Refurbished IT Equipment",
      "IT Equipment Trade-In",
      "IT Asset Value Recovery",
      "Circular IT",
    ],
    founder: { "@id": `${SITE_URL}/#founder` },
    ...(SOCIAL_PROFILES.length > 0 ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

// ---------------------------------------------------------------------------
// WebSite with SearchAction (enables sitelinks search box)
// ---------------------------------------------------------------------------

export function websiteSchema() {
  const url = `${SITE_URL}/`;
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    // The site is branded "Rhydm Tech"; the company behind it is the
    // alternateName. Phase 6 of the brand spec — deliberately the inverse of
    // the Organization node above, which leads with the legal entity.
    name: BRAND,
    alternateName: [COMPANY.legalName, "Rhydm", "rhydm-tech.com"],
    url: url,
    description: COMPANY.description,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/en/refurbished/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["en", "de"],
  };
}

// ---------------------------------------------------------------------------
// LocalBusiness
// ---------------------------------------------------------------------------

export function localBusinessSchema() {
  return {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: BRAND,
    legalName: COMPANY.legalName,
    // Bound to the Organization node, so the Berlin premises read as a
    // location *of* Rhydm Technologies instead of a separate business with a
    // near-identical name and address.
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    url: `${SITE_URL}/`,
    image: abs(LOGO.path),
    description: COMPANY.description,
    email: COMPANY.email,
    telephone: COMPANY.phoneE164,
    address: postalAddressSchema(),
    geo: geoCoordinatesSchema(),
    openingHoursSpecification: OPENING_HOURS_SPECIFICATION,
    priceRange: "$$",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: geoCoordinatesSchema(),
      geoRadius: "50000",
    },
  };
}

// ---------------------------------------------------------------------------
// PostalAddress
// ---------------------------------------------------------------------------

export function postalAddressSchema() {
  return {
    "@type": "PostalAddress",
    streetAddress: COMPANY.address.street,
    addressLocality: COMPANY.address.city,
    postalCode: COMPANY.address.postalCode,
    addressCountry: COMPANY.address.country,
    ...(COMPANY.address.region
      ? { addressRegion: COMPANY.address.region }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// GeoCoordinates
// ---------------------------------------------------------------------------

export function geoCoordinatesSchema() {
  return {
    "@type": "GeoCoordinates",
    latitude: GEO.latitude,
    longitude: GEO.longitude,
  };
}

// ---------------------------------------------------------------------------
// ContactPoint
// ---------------------------------------------------------------------------

export function contactPointSchema() {
  return {
    "@type": "ContactPoint",
    telephone: COMPANY.phoneE164,
    email: COMPANY.email,
    contactType: "customer service",
    areaServed: ["DE", "EU"],
    availableLanguage: ["English", "German"],
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export type BreadcrumbItem = {
  name: string;
  /** Omit for the last (current page) item. */
  url?: string;
};

export function breadcrumbSchema(items: BreadcrumbItem[], locale: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: pageUrl(locale, item.url) } : {}),
    })),
  };
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export type ProductSchemaInput = {
  locale: string;
  name: string;
  slug: string;
  description?: string | null;
  sku: string;
  priceCents: number;
  compareAtCents?: number | null;
  stock: number;
  condition: string;
  warrantyMonths: number;
  ratingAvg: number;
  ratingCount: number;
  brandName?: string | null;
  categoryName?: string;
  images?: { url: string; alt?: string | null }[];
  reviews?: {
    author: string;
    rating: number;
    body: string;
    title?: string | null;
  }[];
};

function conditionUrl(condition: string): string {
  const map: Record<string, string> = {
    GRADE_A: "https://schema.org/RefurbishedCondition",
    GRADE_B: "https://schema.org/RefurbishedCondition",
    GRADE_C: "https://schema.org/RefurbishedCondition",
    OPEN_BOX: "https://schema.org/NewCondition",
  };
  return map[condition] ?? "https://schema.org/RefurbishedCondition";
}

export function productSchema(product: ProductSchemaInput) {
  const price = (product.priceCents / 100).toFixed(2);

  return {
    "@type": "Product",
    "@id": pageUrl(product.locale, `/refurbished/products/${product.slug}`),
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku,
    ...(product.brandName
      ? { brand: { "@type": "Brand", name: product.brandName } }
      : {}),
    ...(product.categoryName
      ? { category: product.categoryName }
      : {}),
    ...(product.images?.length
      ? {
          image: product.images.map((img) => ({
            "@type": "ImageObject",
            url: img.url.startsWith("http") ? img.url : abs(img.url),
            ...(img.alt ? { name: img.alt } : {}),
          })),
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: pageUrl(product.locale, `/refurbished/products/${product.slug}`),
      priceCurrency: "EUR",
      price,
      ...(product.compareAtCents
        ? {
            priceValidUntil: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString().split("T")[0],
          }
        : {}),
      itemCondition: conditionUrl(product.condition),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#organization` },
      warranty: {
        "@type": "WarrantyPromise",
        durationOfWarranty: {
          "@type": "QuantitativeValue",
          value: product.warrantyMonths,
          unitCode: "MON",
        },
      },
    },
    ...(product.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg,
            reviewCount: product.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(product.reviews?.length
      ? {
          review: product.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
            },
            reviewBody: r.body,
            ...(r.title ? { name: r.title } : {}),
          })),
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export type ServiceSchemaInput = {
  name: string;
  slug: string;
  description: string;
};

export function serviceSchema(service: ServiceSchemaInput, locale: string) {
  return {
    "@type": "Service",
    "@id": pageUrl(locale, `/disposal/services/${service.slug}`),
    name: service.name,
    description: service.description,
    serviceType: "IT Asset Disposition",
    areaServed: "Worldwide",
    provider: { "@id": `${SITE_URL}/#organization` },
  };
}

// ---------------------------------------------------------------------------
// FAQPage
// ---------------------------------------------------------------------------

export type FaqItem = { question: string; answer: string };

export function faqSchema(faqs: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// BlogPosting / Article
// ---------------------------------------------------------------------------

export type BlogPostSchemaInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  authorName?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  coverImageUrl?: string | null;
};

export function blogPostSchema(post: BlogPostSchemaInput, locale: string) {
  return {
    "@type": "BlogPosting",
    "@id": pageUrl(locale, `/blog/${post.slug}`),
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.coverImageUrl
      ? {
          image: {
            "@type": "ImageObject",
            url: post.coverImageUrl.startsWith("http")
              ? post.coverImageUrl
              : abs(post.coverImageUrl),
          },
        }
      : {}),
    ...(post.authorName
      ? {
          author: {
            "@type": "Person",
            name: post.authorName,
          },
        }
      : {}),
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(post.publishedAt
      ? { datePublished: new Date(post.publishedAt).toISOString() }
      : {}),
    ...(post.updatedAt
      ? { dateModified: new Date(post.updatedAt).toISOString() }
      : {}),
    mainEntityOfPage: pageUrl(locale, `/blog/${post.slug}`),
    inLanguage: locale,
  };
}

// ---------------------------------------------------------------------------
// CollectionPage (for listing pages)
// ---------------------------------------------------------------------------

export function collectionPageSchema(
  name: string,
  description: string,
  url: string,
  locale: string,
) {
  return {
    "@type": "CollectionPage",
    "@id": pageUrl(locale, url),
    name,
    description,
    url: pageUrl(locale, url),
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

// ---------------------------------------------------------------------------
// HowTo (for process pages)
// ---------------------------------------------------------------------------

export type HowToStep = {
  name: string;
  text: string;
  position: number;
};

export function howToSchema(
  name: string,
  description: string,
  steps: HowToStep[],
) {
  return {
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s) => ({
      "@type": "HowToStep",
      position: s.position,
      name: s.name,
      text: s.text,
    })),
  };
}

// ---------------------------------------------------------------------------
// Graph wrapper — combines multiple schemas into a single @graph
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function graphSchema(...schemas: Record<string, any>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function singleSchema(schema: Record<string, any>) {
  return {
    "@context": "https://schema.org",
    ...schema,
  };
}

export function personSchema(locale: string = "en") {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#founder`,
    name: "Yash Saad",
    jobTitle: "Founder",
    // Reference only. Re-stating `name` here under the organisation's own @id
    // would define a second, contradictory Organization node with the same id.
    worksFor: { "@id": `${SITE_URL}/#organization` },
    url: pageUrl(locale, "/about/yash-saad"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Berlin",
      addressCountry: "Germany",
    },
  };
}
