"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import type { DisposalFinalCtaContent } from "@/lib/cms/registry";

export function ItadFinalCta({ content }: { content: DisposalFinalCtaContent }) {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[36px] bg-gradient-to-b from-[#0F172A] via-[#0A0E17] to-black px-8 py-20 text-center shadow-2xl sm:px-16 sm:py-28"
        >
          {/* Radial Spotlight Ambient Glow */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 size-[48rem] -translate-x-1/2 rounded-full bg-[#16A34A]/15 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
              {content.eyebrow}
            </p>

            <h2
              id="itad-final-cta-heading"
              className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight"
            >
              {content.heading}
            </h2>

            <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
              {content.description}
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row sm:items-center">
              <Link
                href={content.primaryHref}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-8 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#15803D] hover:shadow-xl active:scale-95"
              >
                <span>{content.primaryLabel}</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href={content.secondaryHref}
                className="inline-flex h-13 items-center justify-center rounded-lg border border-slate-700 bg-white/5 px-8 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                {content.secondaryLabel}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-400 border-t border-slate-800/80 pt-8">
              {content.trustItems.map((item) => (
                <span key={item.text} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-[#16A34A]" />
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
