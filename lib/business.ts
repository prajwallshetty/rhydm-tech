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

export const COMPANY = {
  name: "Rhydm Tech",
  legalName: "Rhydm Tech",
  description:
    "Secure IT asset disposal services and certified refurbished IT equipment.",
  email: "hello@rhydm.tech",
  phone: "+1 (555) 014-8820",
  address: {
    street: "120 Enterprise Way",
    city: "Austin",
    region: "TX",
    postalCode: "78701",
    country: "US",
  },
} as const;

/** Used by metadata, sitemap and JSON-LD. Override in production via env. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
