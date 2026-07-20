import type { Division } from "@/lib/business";

export type NavItem = {
  label: string;
  href: string;
};

/**
 * Primary navigation per division. The cross-division link (e.g. "Buy
 * Refurbished") is rendered separately by the header so it can be styled as a
 * distinct action rather than a peer nav item.
 */
export const NAV: Record<Division, NavItem[]> = {
  disposal: [
    { label: "Home", href: "/disposal" },
    { label: "Services", href: "/disposal/services" },
    { label: "Process", href: "/disposal/process" },
    { label: "Industries", href: "/disposal/industries" },
    { label: "Certificates", href: "/disposal/certificates" },
    { label: "FAQs", href: "/disposal/faqs" },
    { label: "Contact", href: "/disposal/contact" },
  ],
  refurbished: [
    { label: "Shop", href: "/refurbished/shop" },
    { label: "Categories", href: "/refurbished/categories" },
    { label: "Brands", href: "/refurbished/brands" },
    { label: "Deals", href: "/refurbished/deals" },
  ],
};

/** Account-area links, shown in the store header's profile menu. */
export const ACCOUNT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/refurbished/account" },
  { label: "Orders", href: "/refurbished/account/orders" },
  { label: "Addresses", href: "/refurbished/account/addresses" },
  { label: "Wishlist", href: "/refurbished/wishlist" },
  { label: "Recently Viewed", href: "/refurbished/account/recently-viewed" },
  { label: "Settings", href: "/refurbished/account/settings" },
];
