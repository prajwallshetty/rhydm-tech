"use client";

import { motion } from "motion/react";
import { Check, X } from "lucide-react";

import { BlurReveal } from "@/components/ui/accentry/blur-reveal";
import type { DisposalComparisonContent } from "@/lib/cms/registry";

export function ItadComparison({ content }: { content: DisposalComparisonContent }) {
  const WITHOUT = content.withoutItems.map((item) => item.text);
  const WITH = content.withItems.map((item) => item.text);

  return (
    <section
      className="bg-slate-50/70 py-24 sm:py-32"
      aria-labelledby="itad-comparison-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BlurReveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
              {content.eyebrow}
            </p>
          </BlurReveal>

          <BlurReveal delay={0.1}>
            <h2
              id="itad-comparison-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl"
            >
              {content.heading}
            </h2>
          </BlurReveal>
        </div>

        <div className="relative mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-stretch">
          {/* Without */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                {content.withoutLabel}
              </p>
              <ul className="mt-6 space-y-4">
                {WITHOUT.map((item) => (
                  <li key={item} className="flex items-center gap-3.5">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-red-50 text-red-500">
                      <X aria-hidden className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm font-semibold text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* With */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-[#0A1120] p-8 text-white shadow-xl"
          >
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#16A34A]">
                {content.withLabel}
              </p>
              <ul className="mt-6 space-y-4">
                {WITH.map((item) => (
                  <li key={item} className="flex items-center gap-3.5">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#16A34A]/20 text-[#16A34A]">
                      <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm font-bold text-white">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
