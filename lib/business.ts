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
  name: "Rhydm Technologies",
  legalName: "Rhydm Technologies",
  description:
    "Rhydm Technologies is a Berlin-based company providing IT asset disposal, secure data destruction, refurbished technology, IT equipment recycling, trade-in/value recovery, and circular IT solutions.",
  email: "hello@rhydm.tech",
  phone: "+49 1516 6196889",
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
  number: "+49 1516 6196889",
  cleanNumber: "4915166196889",
  getUrl: (message?: string) => {
    const base = "https://wa.me/4915166196889";
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
  },
} as const;

/** Used by metadata, sitemap and JSON-LD. Override in production via env. */
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
