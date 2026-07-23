import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { DisposalFloatingNav } from "@/components/disposal/disposal-floating-nav";
import { COMPANY } from "@/lib/business";

export const metadata: Metadata = {
  title: {
    default: "Professional IT Asset Disposal & Secure Data Wiping",
    template: `%s | ${COMPANY.name} Disposal`,
  },
  description:
    "Certified IT asset disposal, secure data wiping, hard drive destruction and e-waste recycling for enterprise IT estates.",
  openGraph: {
    title: "Professional IT Asset Disposal & Secure Data Wiping",
    description:
      "Certified IT asset disposal, secure data wiping and e-waste recycling for enterprise IT estates.",
    url: "/disposal",
  },
};

export default async function DisposalLayout({
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
    <div data-division="disposal" className="flex min-h-dvh flex-col bg-white">
      <DisposalFloatingNav />
      <main className="flex-1">{children}</main>
      <SiteFooter division="disposal" />
    </div>
  );
}
