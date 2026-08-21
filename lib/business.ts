/**
 * Single source of truth for the two business divisions.
 *
 * Both divisions live in one Next.js app on one domain — no subdomains. The
 * visitor's choice is persisted in a cookie (not localStorage) so `proxy.ts`
 * can read it on the server and redirect before any HTML is sent, which avoids
 * the flash of the gateway that a client-side redirect would cause.
 */

export const DIVISIONS = ["disposal", "refurbished"] as const;

export type Division = (typeof DIVISIONS)[number];

export const DIVISION_COOKIE = "rhydm.division";

/** One year, in seconds. */
export const DIVISION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Query flag that suppresses the auto-redirect on `/`, letting the "Switch
 * Business" control return a visitor to the gateway without being bounced
 * straight back to their saved division.
 */
export const SWITCH_PARAM = "switch";

export function isDivision(value: unknown): value is Division {
  return typeof value === "string" && DIVISIONS.includes(value as Division);
}

export type DivisionMeta = {
  slug: Division;
  /** Short label for nav and switcher UI. */
  name: string;
  /** Gateway card title. */
  title: string;
  tagline: string;
  /** Bullets shown on the gateway card. */
  highlights: string[];
  cta: string;
  href: `/${Division}`;
  /** Label linking to the *other* division from inside this one. */
  crossLinkLabel: string;
};

export const DIVISION_META: Record<Division, DivisionMeta> = {
  disposal: {
    slug: "disposal",
    name: "IT Asset Disposal",
    title: "Dispose IT Assets",
    tagline:
      "Certified, auditable decommissioning for enterprise IT estates.",
    highlights: [
      "Secure Data Wiping",
      "IT Asset Disposal",
      "Hard Drive Destruction",
      "E-Waste Recycling",
      "Corporate Pickup",
      "Certificates of Destruction",
    ],
    cta: "Continue",
    href: "/disposal",
    crossLinkLabel: "Buy Refurbished",
  },
  refurbished: {
    slug: "refurbished",
    name: "Refurbished Store",
    title: "Buy Refurbished Devices",
    tagline:
      "Professionally restored business hardware, warranty included.",
    highlights: [
      "Certified Refurbished Laptops",
      "Desktops",
      "Servers",
      "Networking Equipment",
      "Accessories",
    ],
    cta: "Shop Now",
    href: "/refurbished",
    crossLinkLabel: "Dispose Assets",
  },
};

export const DIVISION_LIST: DivisionMeta[] = DIVISIONS.map(
  (slug) => DIVISION_META[slug],
);

/**
 * Brand vs. legal entity.
 *
 * `BRAND` ("Rhydm Tech") is the customer-facing name and the string users
 * actually type into Google. `COMPANY.legalName` ("Rhydm Technologies") is the
 * registered entity behind it. Search engines only merge the two into one
 * entity if the site says so consistently, so presentation surfaces (titles,
 * og:site_name, logo alt, manifest) use BRAND while legal/structured-data
 * surfaces (Impressum, Organization.legalName) use the full company name.
 */
export const BRAND = "Rhydm Tech" as const;

export const COMPANY = {
  /** Registered entity name — used for Organization schema and legal pages. */
  name: "Rhydm Technologies",
  legalName: "Rhydm Technologies",
  /** Customer-facing brand. Alias of BRAND, kept here for call-site ergonomics. */
  brand: BRAND,
  description:
    "Rhydm Tech is the technology brand of Rhydm Technologies, a Berlin-based company providing IT asset disposal, secure data destruction, refurbished technology, IT equipment recycling, trade-in and value recovery, and circular IT solutions across Germany.",
  email: "hello@rhydm.tech",
  phone: "+49 15560 765557",
  /** E.164, for tel: links and schema.org telephone. */
  phoneE164: "+4915560765557",
  address: {
    street: "Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage",
    city: "Berlin",
    region: "",
    postalCode: "13599",
    country: "Germany",
  },
  geo: {
    latitude: 52.54829,
    longitude: 13.25174,
  },
  openingHours: "Mo-Fr 09:00-18:00",
  foundingDate: "2024",
} as const;

export const WHATSAPP = {
  number: "+49 15560 765557",
  cleanNumber: "4915560765557",
  getUrl: (message?: string) => {
    const base = "https://wa.me/4915560765557";
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
  },
} as const;

/**
 * Canonical origin, used by metadata, sitemap, redirects and JSON-LD.
 *
 * The canonical host is the **apex** domain, no `www`. `proxy.ts` redirects
 * `www.rhydm-tech.com` here, so this constant and that redirect must always
 * agree — if they ever disagree the site emits canonicals pointing at a URL
 * that immediately 301s, which is the fastest way to split an entity in two.
 */
export const SITE_URL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const isProd = process.env.NODE_ENV === "production";
  
  if (isProd) {
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
      return envUrl;
    }
    return "https://rhydm-tech.com";
  }
  
  return envUrl ?? "http://localhost:3000";
})();
