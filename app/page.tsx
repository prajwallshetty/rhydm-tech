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
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 sm:py-20">
      <GatewayBackdrop />

      <div className="relative w-full max-w-5xl">
        <FadeIn className="flex justify-center">
          <Logo />
        </FadeIn>

        <FadeIn delay={0.1} className="mt-12 text-center sm:mt-14">
          <h1 className="mx-auto max-w-2xl text-pretty text-4xl font-semibold tracking-tight sm:text-5xl md:text-[3.5rem] md:leading-[1.05]">
            Choose the service you&rsquo;re looking for
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            We provide secure IT asset disposal services and premium refurbished
            electronics.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-6 sm:mt-16 md:grid-cols-2 md:gap-8">
          {DIVISION_LIST.map((division, index) => (
            <GatewayCard key={division.slug} division={division} index={index} />
          ))}
        </div>

        <FadeIn delay={0.6} className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            You can switch between services at any time from the header.
          </p>
        </FadeIn>
      </div>
    </main>
  );
}
