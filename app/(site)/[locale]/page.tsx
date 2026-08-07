import { getTranslations, setRequestLocale } from "next-intl/server";

import { GatewayBackdrop } from "@/components/gateway/gateway-backdrop";
import { GatewayCard } from "@/components/gateway/gateway-card";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { FadeIn } from "@/components/motion/fade-in";
import { DIVISION_LIST } from "@/lib/business";
import { createPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "Secure IT Asset Disposal & Certified Refurbished IT Equipment",
    description:
      "Rhydm Tech provides enterprise-grade IT asset disposal with certified data destruction, and professionally refurbished laptops, desktops and servers with warranty.",
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
          <Logo />
        </FadeIn>

        {/* Title & Subtitle */}
        <FadeIn delay={0.1} className="text-center space-y-2">
          <h1 className="mx-auto max-w-2xl text-pretty text-2xl sm:text-4xl md:text-[2.75rem] font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-xl text-pretty text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </FadeIn>

        {/* Gateway Cards Grid */}
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
