import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { COMPANY } from "@/lib/business";

export const metadata: Metadata = {
  title: {
    default: "Professional IT Asset Disposal & Secure Data Wiping",
    template: `%s | ${COMPANY.name} Disposal`,
  },
  description:
    "Certified IT asset disposal, secure data wiping, hard drive destruction and e-waste recycling for enterprise IT estates.",
  alternates: { canonical: "/disposal" },
  openGraph: {
    title: "Professional IT Asset Disposal & Secure Data Wiping",
    description:
      "Certified IT asset disposal, secure data wiping and e-waste recycling for enterprise IT estates.",
    url: "/disposal",
  },
};

export default function DisposalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `data-division` swaps the brand accent tokens for this entire subtree —
  // see the [data-division] rules in globals.css.
  return (
    <div data-division="disposal" className="flex min-h-dvh flex-col">
      <SiteHeader division="disposal" />
      <main className="flex-1">{children}</main>
      <SiteFooter division="disposal" />
    </div>
  );
}
