import type { Metadata } from "next";

import { GatewayBackdrop } from "@/components/gateway/gateway-backdrop";
import { GatewayCard } from "@/components/gateway/gateway-card";
import { Logo } from "@/components/brand/logo";
import { FadeIn } from "@/components/motion/fade-in";
import { COMPANY, DIVISION_LIST } from "@/lib/business";

export const metadata: Metadata = {
  title: `${COMPANY.name} — Choose Your Service`,
  description:
    "We provide secure IT asset disposal services and premium refurbished electronics. Choose the service you're looking for.",
  alternates: { canonical: "/" },
  openGraph: {
    title: `${COMPANY.name} — Choose Your Service`,
    description: COMPANY.description,
    url: "/",
  },
};

export default function GatewayPage() {
  return (
    <main className="relative flex h-screen min-h-screen w-full flex-col items-center justify-between overflow-hidden px-6 py-6 sm:py-8 font-sans">
      <GatewayBackdrop />

      <div className="relative w-full max-w-4xl flex-1 flex flex-col justify-between my-auto py-2">
        {/* Top Header Logo */}
        <FadeIn className="flex justify-center">
          <Logo />
        </FadeIn>

        {/* Title & Subtitle */}
        <FadeIn delay={0.1} className="text-center mt-4 sm:mt-6 space-y-2">
          <h1 className="mx-auto max-w-2xl text-pretty text-3xl font-black tracking-tight sm:text-4xl md:text-[2.75rem] leading-tight text-slate-900 dark:text-white">
            Choose the service you&rsquo;re looking for
          </h1>
          <p className="mx-auto max-w-xl text-pretty text-xs sm:text-sm leading-relaxed text-muted-foreground">
            We provide secure IT asset disposal services and premium refurbished electronics.
          </p>
        </FadeIn>

        {/* Gateway Cards Grid */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 items-stretch flex-1 max-h-[460px]">
          {DIVISION_LIST.map((division, index) => (
            <GatewayCard key={division.slug} division={division} index={index} />
          ))}
        </div>

        {/* Bottom Switch Note */}
        <FadeIn delay={0.4} className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            You can switch between services at any time from the top navigation header.
          </p>
        </FadeIn>
      </div>
    </main>
  );
}
