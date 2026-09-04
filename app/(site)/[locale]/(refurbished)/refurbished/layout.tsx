import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { FloatingNav } from "@/components/store/floating-nav";
import { Toaster } from "@/components/ui/toast";
import { BRAND } from "@/lib/business";

export const metadata: Metadata = {
  // Template matches the root layout's exactly ("%s | Rhydm Tech"). A
  // division-specific suffix ("... Store") here would override the root's
  // for every page below it, so the whole storefront would title itself
  // "... | Rhydm Tech Store" — a second, competing brand string.
  title: {
    default: "Certified Refurbished Laptops & IT Equipment",
    template: `%s | ${BRAND}`,
  },
  description:
    "Professionally refurbished laptops, desktops, servers, networking equipment and accessories — tested, graded and warranty-backed.",
  openGraph: {
    title: "Certified Refurbished Laptops & IT Equipment",
    description:
      "Professionally refurbished business hardware — tested, graded and warranty-backed.",
    url: "/refurbished",
  },
};

export default async function RefurbishedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // App Router layouts render in isolated scopes — each needs its own call
  // for next-intl to keep the subtree statically renderable.
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div data-division="refurbished" className="flex min-h-dvh flex-col bg-white">
      <FloatingNav />
      <main className="flex-1 pt-28">{children}</main>
      <SiteFooter division="refurbished" />
      <Toaster />
    </div>
  );
}
