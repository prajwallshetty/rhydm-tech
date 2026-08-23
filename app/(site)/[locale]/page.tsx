import { getTranslations, setRequestLocale } from "next-intl/server";

import { GatewayBackdrop } from "@/components/gateway/gateway-backdrop";
import { GatewayCard } from "@/components/gateway/gateway-card";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { FadeIn } from "@/components/motion/fade-in";
import { DIVISION_LIST } from "@/lib/business";
import { createPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isDe = locale === "de";

  return createPageMetadata({
    locale,
    title: isDe
      ? "Rhydm Tech – IT Asset Disposal & Refurbished IT"
      : "Rhydm Tech | IT Asset Disposal & Refurbished Technology",
    absoluteTitle: true,
    description: isDe
      ? "Rhydm Tech ist ein in Berlin ansässiges Technologieunternehmen, das sich auf IT-Asset-Disposition (ITAD), sichere Datenvernichtung, zirkuläre IT-Lösungen und hochwertige generalüberholte IT-Geräte spezialisiert hat."
      : "Rhydm Tech is a Berlin-based technology company specializing in IT asset disposition, secure data destruction, circular IT solutions, and premium refurbished technology.",
    path: "/",
    keywords: [
      "IT Asset Disposal",
      "Refurbished IT Equipment",
      "Certified Refurbished Laptops",
      "Secure Data Wiping",
      "E-Waste Recycling",
    ],
  });
}

export default async function GatewayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gateway");

  // Division card copy is localized here; hrefs/slugs/icons stay structural.
  const divisions = DIVISION_LIST.map((division) => ({
    ...division,
    title: t(`${division.slug}.title`),
    tagline: t(`${division.slug}.tagline`),
    cta: t(`${division.slug}.cta`),
    highlights: division.highlights.map((_, i) =>
      t(`${division.slug}.highlights.${i}`),
    ),
  }));

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-x-hidden px-4 sm:px-6 py-6 sm:py-8 font-sans">
      <GatewayBackdrop />

      <div className="absolute top-4 right-4 sm:right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-4xl flex-1 flex flex-col justify-between my-auto py-2 gap-6">
        {/* Top Header Logo */}
        <FadeIn className="flex justify-center pt-2 sm:pt-0">
          <Logo className="h-12 sm:h-14" priority />
        </FadeIn>

        {/*
          The H1 is the bare brand. This is the page Google ranks for the query
          "Rhydm Tech", and the brand has to exist here as real crawlable text —
          the logo above it is an image and carries no textual signal. The
          paragraph beneath states the brand-to-company relationship once, in
          plain prose, which is what lets the two names resolve to one entity.
        */}
        <FadeIn delay={0.1} className="text-center space-y-3">
          <h1 className="mx-auto max-w-2xl text-pretty text-3xl sm:text-5xl md:text-[3.25rem] font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {t("brandDescription")}
          </p>
        </FadeIn>

        {/* Gateway Cards Grid */}
        <p className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t("subtitle")}
        </p>
        <div className="grid gap-6 md:grid-cols-2 items-stretch flex-1">
          {divisions.map((division, index) => (
            <GatewayCard key={division.slug} division={division} index={index} />
          ))}
        </div>

        {/* Bottom Switch Note */}
        <FadeIn delay={0.4} className="text-center pb-2">
          <p className="text-xs text-muted-foreground">
            {t("switchNote")}
          </p>
        </FadeIn>
      </div>
    </main>
  );
}
