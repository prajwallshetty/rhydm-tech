"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Star, Quote, Building2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { BlurReveal } from "@/components/ui/accentry/blur-reveal";
import { SpotlightCard } from "@/components/ui/accentry/spotlight-card";

export type ItadTestimonial = {
  id: string;
  quote: string;
  author: string;
  role: string | null;
  company: string | null;
  rating: number | null;
};

export function ItadTestimonials({
  testimonials,
}: {
  testimonials: ItadTestimonial[];
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const tr = useTranslations("disposal.testimonialsSec");

  if (!testimonials || testimonials.length === 0) return null;
  const current = testimonials[index];

  function go(delta: number) {
    setDirection(delta);
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length);
  }

  return (
    <section
      className="relative overflow-hidden bg-white py-24 sm:py-32 text-slate-900"
      aria-labelledby="itad-testimonials-heading"
    >
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center">
          <BlurReveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
              {tr("eyebrow")}
            </p>
          </BlurReveal>

          <BlurReveal delay={0.1}>
            <h2
              id="itad-testimonials-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl"
            >
              {tr("title")}
            </h2>
          </BlurReveal>
        </div>

        {/* Large Story Panel Container with Spotlight Card */}
        <div className="relative mt-16">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <SpotlightCard
                spotlightColor="rgba(22, 163, 74, 0.12)"
                borderColor="rgba(22, 163, 74, 0.35)"
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70 p-10 shadow-lg sm:p-16"
              >
                <Quote className="absolute right-8 top-8 size-28 text-slate-200/50 pointer-events-none" />

                {current.rating != null && (
                  <div
                    className="flex items-center gap-1.5"
                    role="img"
                    aria-label={`Rated ${current.rating} out of 5`}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        aria-hidden
                        className={
                          i < (current.rating ?? 0)
                            ? "size-5 fill-amber-400 text-amber-400"
                            : "size-5 text-slate-200"
                        }
                      />
                    ))}
                  </div>
                )}

                <blockquote className="mt-8 text-2xl font-medium leading-relaxed text-[#0F172A] text-pretty sm:text-3xl lg:text-4xl">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      aria-hidden
                      className="grid size-14 place-items-center rounded-2xl bg-[#16A34A] text-lg font-black text-white shadow-lg"
                    >
                      {current.author
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>

                    <div>
                      <span className="block text-lg font-bold text-[#0F172A]">
                        {current.author}
                      </span>
                      <span className="block text-sm font-semibold text-[#16A34A]">
                        {[current.role, current.company].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700">
                    <Building2 className="size-4 text-[#16A34A]" />
                    <span>{tr("caseStudy")}</span>
                  </div>
                </figcaption>
              </SpotlightCard>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  // 44px hit area; the visual dot is the inner span.
                  className="grid h-11 min-w-11 place-items-center"
                  aria-label={tr("goToSlide", { n: i + 1 })}
                >
                  <span
                    aria-hidden
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === index ? "w-8 bg-[#16A34A]" : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={tr("prev")}
                className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={() => go(1)}
                aria-label={tr("next")}
                className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
