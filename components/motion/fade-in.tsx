import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  /** Distance in px the element travels upward as it fades in. */
  y?: number;
  className?: string;
  /** Kept for API compatibility; both modes now animate from first paint. */
  onScroll?: boolean;
};

/**
 * Shared entrance animation, CSS-driven. The Motion version held content at
 * `opacity: 0` until hydration, which Lighthouse measured as 7–11s LCP on
 * throttled mobile (the gateway h1 was the LCP element). CSS animates from
 * first paint; the global `prefers-reduced-motion` rule disables it for
 * users who opt out. Trade-off, accepted deliberately: below-the-fold
 * sections no longer wait to animate until scrolled into view — by the time
 * a user reaches them they simply appear settled.
 */
export function FadeIn({
  children,
  delay = 0,
  y = 16,
  className,
}: FadeInProps) {
  return (
    <div
      className={cn("animate-reveal", className)}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-duration": "0.6s",
          "--reveal-y": `${y}px`,
          "--reveal-blur": "0px",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
