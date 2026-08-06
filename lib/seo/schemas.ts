/**
 * JSON-LD structured data generators.
 *
 * Each function returns a plain object ready to be serialised via the
 * `<JsonLd>` component. The `@context` is included by the component, so
 * generators only produce the body.
 */

import { COMPANY, SITE_URL, type Division } from "@/lib/business";
import {
  GEO,
  OPENING_HOURS_SPECIFICATION,
  SOCIAL_PROFILES,
} from "./constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Absolute URL from a path. */
function abs(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ---------------------------------------------------------------------------
// Organization (appears on every page via the root layout)
// ---------------------------------------------------------------------------

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: abs("/logo.png"),
      width: 512,
      height: 512,
    },
    image: abs("/logo.png"),
    description: COMPANY.description,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    address: postalAddressSchema(),
    contactPoint: contactPointSchema(),
    geo: geoCoordinatesSchema(),
    ...(SOCIAL_PROFILES.length > 0 ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

// ---------------------------------------------------------------------------
// WebSite with SearchAction (enables sitelinks search box)
// ---------------------------------------------------------------------------

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: COMPANY.name,
    url: SITE_URL,
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
    name: COMPANY.name,
    url: SITE_URL,
    image: abs("/logo.png"),
    description: COMPANY.description,
    email: COMPANY.email,
    telephone: COMPANY.phone,
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
    telephone: COMPANY.phone,
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

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: abs(item.url) } : {}),
    })),
  };
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export type ProductSchemaInput = {
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
    "@id": abs(`/refurbished/products/${product.slug}`),
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
      url: abs(`/refurbished/products/${product.slug}`),
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

export function serviceSchema(service: ServiceSchemaInput) {
  return {
    "@type": "Service",
    "@id": abs(`/disposal/services/${service.slug}`),
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

export function blogPostSchema(post: BlogPostSchemaInput) {
  return {
    "@type": "BlogPosting",
    "@id": abs(`/blog/${post.slug}`),
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
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    inLanguage: "en",
  };
}

// ---------------------------------------------------------------------------
// CollectionPage (for listing pages)
// ---------------------------------------------------------------------------

export function collectionPageSchema(
  name: string,
  description: string,
  url: string,
) {
  return {
    "@type": "CollectionPage",
    "@id": abs(url),
    name,
    description,
    url: abs(url),
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
