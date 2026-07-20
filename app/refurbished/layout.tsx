import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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
      <SiteHeader division="refurbished" />
      <main className="flex-1">{children}</main>
      <SiteFooter division="refurbished" />
    </div>
  );
}
