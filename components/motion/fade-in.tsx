"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  /** Distance in px the element travels upward as it fades in. */
  y?: number;
  className?: string;
  /** Animate when scrolled into view instead of on mount. */
  onScroll?: boolean;
};

/**
 * Shared entrance animation. Motion respects `prefers-reduced-motion` for
 * transforms automatically when the user has it enabled at the OS level.
 */
export function FadeIn({
  children,
  delay = 0,
  y = 16,
  className,
  onScroll = false,
}: FadeInProps) {
  const animation = {
    initial: { opacity: 0, y },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  };

  if (onScroll) {
    return (
      <motion.div
        {...animation}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div {...animation} animate={{ opacity: 1, y: 0 }} className={className}>
      {children}
    </motion.div>
  );
}
