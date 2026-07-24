import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { GatewayBackdrop } from "@/components/gateway/gateway-backdrop";
import { GatewayCard } from "@/components/gateway/gateway-card";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { FadeIn } from "@/components/motion/fade-in";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { COMPANY, DIVISION_LIST } from "@/lib/business";

export const metadata: Metadata = {
  title: `${COMPANY.name} — Choose Your Service`,
  description:
    "We provide secure IT asset disposal services and premium refurbished electronics. Choose the service you're looking for.",
  openGraph: {
    title: `${COMPANY.name} — Choose Your Service`,
    description: COMPANY.description,
    url: "/",
  },
};

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
    <main className="relative flex h-screen min-h-screen w-full flex-col items-center justify-between overflow-hidden px-6 py-6 sm:py-8 font-sans">
      <GatewayBackdrop />

      <div className="absolute top-4 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-4xl flex-1 flex flex-col justify-between my-auto py-2">
        {/* Top Header Logo & Language Switcher */}
        <FadeIn className="flex justify-between items-center w-full">
          <div className="w-14" /> {/* Spacer to balance LanguageSwitcher width */}
          <Logo />
          <LanguageSwitcher className="text-slate-900 dark:text-white" />
        </FadeIn>

        {/* Title & Subtitle */}
        <FadeIn delay={0.1} className="text-center mt-4 sm:mt-6 space-y-2">
          <h1 className="mx-auto max-w-2xl text-pretty text-3xl font-black tracking-tight sm:text-4xl md:text-[2.75rem] leading-tight text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-xl text-pretty text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </FadeIn>

        {/* Gateway Cards Grid */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 items-stretch flex-1 max-h-[460px]">
          {divisions.map((division, index) => (
            <GatewayCard key={division.slug} division={division} index={index} />
          ))}
        </div>

        {/* Bottom Switch Note */}
        <FadeIn delay={0.4} className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            {t("switchNote")}
          </p>
        </FadeIn>
      </div>
    </main>
  );
}
