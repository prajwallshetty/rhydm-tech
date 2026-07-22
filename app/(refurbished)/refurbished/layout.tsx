import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { StoreHeader } from "@/components/store/store-header";
import { Toaster } from "@/components/ui/toast";
import { COMPANY } from "@/lib/business";

export const metadata: Metadata = {
  title: {
    default: "Certified Refurbished Laptops & IT Equipment",
    template: `%s | ${COMPANY.name} Store`,
  },
  description:
    "Professionally refurbished laptops, desktops, servers, networking equipment and accessories — tested, graded and warranty-backed.",
  alternates: { canonical: "/refurbished" },
  openGraph: {
    title: "Certified Refurbished Laptops & IT Equipment",
    description:
      "Professionally refurbished business hardware — tested, graded and warranty-backed.",
    url: "/refurbished",
  },
};

export default function RefurbishedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-division="refurbished" className="flex min-h-dvh flex-col">
      <StoreHeader />
      {/* The store nav is a fixed floating pill (top-4, ~64px tall), so it
          overlays the page rather than occupying flow space — without this
          top padding every page's first section renders underneath it. */}
      <main className="flex-1 pt-24">{children}</main>
      <SiteFooter division="refurbished" />
      <Toaster />
    </div>
  );
}
