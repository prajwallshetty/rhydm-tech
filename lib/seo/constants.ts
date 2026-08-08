/**
 * Centralized SEO constants used across metadata generators and JSON-LD schemas.
 *
 * Social profiles, verification IDs and analytics keys are env-driven so they
 * produce zero output until configured.  Nothing here is hardcoded to a
 * specific deployment URL — SITE_URL (from lib/business) is always used.
 */

// ---------------------------------------------------------------------------
// Default keyword lists per division
// ---------------------------------------------------------------------------

export const KEYWORDS_GLOBAL = [
  "Rhydm Tech",
  "Rhydm",
  "IT Asset Disposal",
  "Refurbished IT Equipment",
  "ITAD",
  "Certified Refurbished",
  "Secure Data Destruction",
  "E-Waste Recycling",
  "Berlin IT Services",
] as const;

export const KEYWORDS_DISPOSAL = [
  "IT Asset Disposal",
  "IT Asset Disposition",
  "ITAD",
  "Secure Data Wiping",
  "Hard Drive Destruction",
  "Data Destruction",
  "E-Waste Recycling",
  "Corporate IT Disposal",
  "Enterprise ITAD",
  "Certified Data Destruction",
  "IT Lifecycle Management",
  "Asset Recovery",
  "NIST 800-88",
  "GDPR Compliant Disposal",
  "Rhydm Tech",
] as const;

export const KEYWORDS_REFURBISHED = [
  "Refurbished Laptops",
  "Refurbished IT Equipment",
  "Certified Refurbished",
  "Refurbished Desktops",
  "Refurbished Servers",
  "Refurbished Networking Equipment",
  "Used Business Hardware",
  "Warranty Refurbished",
  "Grade A Refurbished",
  "Enterprise Refurbished Equipment",
  "Rhydm Tech",
] as const;

// ---------------------------------------------------------------------------
// Social media profiles (used in Organization schema `sameAs`)
// ---------------------------------------------------------------------------

export const SOCIAL_PROFILES: string[] = [
  // Add profiles as they become available, e.g.:
  // "https://www.linkedin.com/company/rhydm-tech",
  // "https://twitter.com/rhydmtech",
  // "https://www.facebook.com/rhydmtech",
];

// ---------------------------------------------------------------------------
// Opening hours (ISO 8601 / Schema.org format)
// ---------------------------------------------------------------------------

export const OPENING_HOURS = "Mo-Fr 09:00-18:00";

export const OPENING_HOURS_SPECIFICATION = [
  {
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
];

// ---------------------------------------------------------------------------
// Geo coordinates (Rhydm Tech Berlin office)
// ---------------------------------------------------------------------------

export const GEO = {
  latitude: 52.54829,
  longitude: 13.25174,
} as const;

// ---------------------------------------------------------------------------
// Verification IDs — all env-driven, no output if absent
// ---------------------------------------------------------------------------

export const VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "NRyhRImSNo9G1SJGfE9rUXMV4FUgLhyHBj-hdeKSsGA",
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? undefined,
  yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION ?? undefined,
} as const;

// ---------------------------------------------------------------------------
// Analytics IDs — checked at render time by the Analytics component
// ---------------------------------------------------------------------------

export const ANALYTICS = {
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? undefined,
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? undefined,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? undefined,
  linkedInPartnerId: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID ?? undefined,
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? undefined,
} as const;
