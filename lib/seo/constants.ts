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
  "Rhydm Technologies",
  "Rhydm",
  "Rhydm Tech",
  "Rhydm Technologies Germany",
  "IT Asset Disposal Germany",
  "IT Asset Disposal Berlin",
  "ITAD Berlin",
  "Refurbished IT Equipment Germany",
  "Certified Refurbished",
  "Secure Data Destruction Berlin",
  "E-Waste Recycling Germany",
] as const;

export const KEYWORDS_DISPOSAL = [
  "IT Asset Disposal Berlin",
  "IT Asset Disposition",
  "ITAD Berlin",
  "ITAD Germany",
  "Secure Data Wiping",
  "Hard Drive Destruction",
  "Data Destruction Berlin",
  "E-Waste Recycling Germany",
  "Corporate IT Disposal",
  "Enterprise ITAD",
  "Certified Data Destruction",
  "IT Lifecycle Management",
  "Asset Recovery",
  "NIST 800-88",
  "GDPR Compliant Disposal",
  "Rhydm Technologies",
  "Rhydm Tech",
] as const;

export const KEYWORDS_REFURBISHED = [
  "Refurbished Laptops Berlin",
  "Refurbished IT Equipment Germany",
  "Certified Refurbished Laptops",
  "Refurbished Desktops",
  "Refurbished Servers",
  "Refurbished Networking Equipment",
  "Used Business Hardware Germany",
  "Warranty Refurbished",
  "Grade A Refurbished",
  "Enterprise Refurbished Equipment",
  "Rhydm Technologies",
  "Rhydm Tech",
] as const;

// ---------------------------------------------------------------------------
// Social media profiles (used in Organization schema `sameAs`)
// ---------------------------------------------------------------------------

export const SOCIAL_PROFILES: string[] = [
  "https://x.com/Rhydmtech",
  "https://www.instagram.com/rhydm.tech/",
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
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "SZWk6L7TOSxkS-bqRkleVL9NBJuzNYaFFBPAvyFoppM",
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
