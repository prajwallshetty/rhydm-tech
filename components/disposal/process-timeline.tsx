"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

export type Step = {
  id: string;
  step: number;
  title: string;
  description: string;
};

/**
 * Vertical timeline whose progress line fills as the section scrolls through
 * the viewport. The spring smooths the raw scroll value so the line does not
 * jitter with trackpad input.
 */
export function ProcessTimeline({ steps }: { steps: Step[] }) {
  const containerRef = useRef<HTMLOListElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 60%"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <ol ref={containerRef} className="relative mx-auto max-w-3xl">
      {/* Track */}
      <div
        aria-hidden
        className="absolute left-[19px] top-2 bottom-2 w-px bg-border sm:left-[23px]"
      />
      {/* Fill */}
      <motion.div
        aria-hidden
        style={{ scaleY }}
        className="absolute left-[19px] top-2 bottom-2 w-px origin-top bg-brand sm:left-[23px]"
      />

      {steps.map((step, index) => (
        <motion.li
          key={step.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.5,
            delay: index * 0.05,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative flex gap-6 pb-12 last:pb-0 sm:gap-8"
        >
          <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-brand/30 bg-brand-muted text-sm font-semibold text-brand sm:size-12">
            {step.step}
          </span>

          <div className="pt-1.5 sm:pt-2.5">
            <h3 className="text-lg font-medium">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
