"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";

export type ItadTestimonial = {
  id: string;
  quote: string;
  author: string;
  role: string | null;
  company: string | null;
  rating: number | null;
};

/**
 * Testimonial carousel driven by the Testimonial table. Manual navigation
 * only — auto-advancing carousels fail WCAG 2.2.2 unless pausable, and a
 * pause control costs more than it's worth here.
 */
export function ItadTestimonials({
  testimonials,
}: {
  testimonials: ItadTestimonial[];
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  if (testimonials.length === 0) return null;
  const current = testimonials[index];

  function go(delta: number) {
    setDirection(delta);
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length);
  }

  return (
    <section
      className="overflow-hidden bg-white py-24 sm:py-32"
      aria-labelledby="itad-testimonials-heading"
    >
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Testimonials
          </p>
          <h2
            id="itad-testimonials-heading"
            className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 text-balance sm:text-5xl"
          >
            Trusted by the teams who get audited
          </h2>
        </div>

        <div className="relative mt-14">
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={current.id}
              initial={{ opacity: 0, x: 40 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 * direction }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[32px] border border-gray-200 bg-white/80 p-10 shadow-[0_24px_70px_-28px_rgba(17,24,39,0.18)] backdrop-blur-xl sm:p-14"
            >
              {current.rating != null && (
                <div
                  className="flex justify-center gap-1"
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
                          : "size-5 text-gray-200"
                      }
                    />
                  ))}
                </div>
              )}

              <blockquote className="mt-8 text-center text-xl font-medium leading-relaxed text-gray-900 text-pretty sm:text-2xl">
                &ldquo;{current.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-9 flex items-center justify-center gap-4">
                {/* Initials avatar — no fake stock photos. */}
                <span
                  aria-hidden
                  className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-sm font-extrabold text-white"
                >
                  {current.author
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="text-left">
                  <span className="block text-sm font-bold text-gray-900">
                    {current.author}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {[current.role, current.company].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="grid size-11 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-blue-600/40 hover:text-blue-600"
            >
              <ChevronLeft className="size-5" />
            </button>

            <div className="flex items-center gap-2" aria-hidden>
              {testimonials.map((t, i) => (
                <span
                  key={t.id}
                  className={
                    i === index
                      ? "h-2 w-6 rounded-full bg-blue-600 transition-all"
                      : "size-2 rounded-full bg-gray-300 transition-all"
                  }
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="grid size-11 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-blue-600/40 hover:text-blue-600"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
