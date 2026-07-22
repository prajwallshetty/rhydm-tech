"use client";

import { motion } from "motion/react";

export type ItadProcessStep = {
  id: string;
  step: number;
  title: string;
  description: string;
};

/**
 * Horizontal timeline (vertical on mobile) with an animated connecting line
 * that draws itself as the section scrolls into view. Steps come from the
 * ProcessStep table, managed in the admin CMS.
 */
export function ItadProcess({ steps }: { steps: ItadProcessStep[] }) {
  return (
    <section
      id="itad-process"
      className="scroll-mt-24 bg-white py-24 sm:py-32"
      aria-labelledby="itad-process-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Process
          </p>
          <h2
            id="itad-process-heading"
            className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 text-balance sm:text-5xl"
          >
            From pickup to certificate, fully documented
          </h2>
        </div>

        {/* Desktop: horizontal rail */}
        <div className="relative mt-20 hidden lg:block">
          {/* Track + animated fill */}
          <div className="absolute left-0 right-0 top-7 h-0.5 bg-gray-200" />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-7 h-0.5 origin-left bg-gradient-to-r from-blue-600 to-emerald-500"
          />

          <ol className="relative grid grid-cols-7 gap-4">
            {steps.map((step, i) => (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="text-center"
              >
                <span className="relative z-10 mx-auto grid size-14 place-items-center rounded-full border-2 border-blue-600/20 bg-white text-base font-extrabold text-blue-600 shadow-sm">
                  {step.step}
                </span>
                <h3 className="mt-5 text-sm font-bold tracking-tight text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Mobile / tablet: vertical rail */}
        <ol className="relative mx-auto mt-14 max-w-md lg:hidden">
          <div
            aria-hidden
            className="absolute bottom-4 left-6 top-4 w-0.5 bg-gradient-to-b from-blue-600 to-emerald-500"
          />
          {steps.map((step, i) => (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="relative flex gap-6 pb-10 last:pb-0"
            >
              <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-2 border-blue-600/20 bg-white text-sm font-extrabold text-blue-600 shadow-sm">
                {step.step}
              </span>
              <div className="pt-1.5">
                <h3 className="text-base font-bold tracking-tight text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
