"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Animated number counter. Counts from 0 to `value` when scrolled into view,
 * once. Falls back to rendering the final value immediately for reduced
 * motion, and before hydration the final value is server-rendered so the
 * number is never missing from the HTML (SEO + no-JS).
 */
export function Counter({
  value,
  suffix = "",
  duration = 1.6,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();

  const formatter = new Intl.NumberFormat("en-US");

  useEffect(() => {
    if (!inView || reduceMotion || !ref.current) return;

    const node = ref.current;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        node.textContent = formatter.format(Math.round(latest)) + suffix;
      },
    });

    return () => controls.stop();
    // formatter is stable for our purposes; recreating it doesn't change output.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, value, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {formatter.format(value)}
      {suffix}
    </span>
  );
}
