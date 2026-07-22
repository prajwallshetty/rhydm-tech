"use client";

import { motion } from "motion/react";
import { Clock, Globe, Recycle, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";

import { BlurReveal } from "@/components/ui/accentry/blur-reveal";
import { SpotlightCard } from "@/components/ui/accentry/spotlight-card";
import type { DisposalWhyContent } from "@/lib/cms/registry";

/** CMS stores icons as strings; unknown keys fall back rather than crash. */
const ICONS: Record<string, LucideIcon> = {
  trending: TrendingUp,
  clock: Clock,
  globe: Globe,
  shield: ShieldCheck,
  recycle: Recycle,
};

export function ItadWhyBento({ content }: { content: DisposalWhyContent }) {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32" aria-labelledby="itad-why-heading">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BlurReveal>
            <h2
              id="itad-why-heading"
              className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A]"
            >
              {content.heading}
            </h2>
          </BlurReveal>
        </div>

        {/* Clean Dashed Border Tech Cards Inspired by Reference (Without Corner Squares) */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {content.cards.map((card, i) => {
            const Icon = ICONS[card.icon] ?? TrendingUp;
            return (
            <motion.div
              key={`${card.stat}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <SpotlightCard
                spotlightColor="rgba(22, 163, 74, 0.08)"
                borderColor="rgba(22, 163, 74, 0.4)"
                className="relative flex h-full flex-col justify-between rounded-2xl border border-dashed border-[#16A34A]/40 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:border-[#16A34A]"
              >
                <div>
                  {/* Clean Icon */}
                  <div className="mb-6">
                    <Icon className="size-9 text-[#16A34A]" strokeWidth={1.75} />
                  </div>

                  {/* Big Metric Stat */}
                  <div className="text-4xl font-extrabold tracking-tight text-[#16A34A] sm:text-5xl">
                    {card.stat}
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 font-semibold">
                    {card.body}
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
