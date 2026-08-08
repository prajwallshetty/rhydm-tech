import React from "react";
import { setRequestLocale } from "next-intl/server";
import { DisposalFloatingNav } from "@/components/disposal/disposal-floating-nav";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
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
