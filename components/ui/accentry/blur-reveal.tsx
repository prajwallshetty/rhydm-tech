import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BlurRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blurAmount?: number;
  once?: boolean;
}

/**
 * CSS-driven entrance reveal. Previously Motion-based with `initial
 * opacity: 0`, which meant server-rendered text stayed invisible until
 * hydration — Lighthouse measured hero LCP at 7–11s on throttled mobile
 * purely from that gate. CSS animates from first paint instead; the global
 * `prefers-reduced-motion` rule zeroes it for users who opt out.
 */
export function BlurReveal({
  children,
  className,
  delay = 0,
  duration = 0.7,
  yOffset = 20,
  blurAmount = 8,
}: BlurRevealProps) {
  return (
    <div
      className={cn("animate-reveal", className)}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-duration": `${duration}s`,
          "--reveal-y": `${yOffset}px`,
          "--reveal-blur": `${blurAmount}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
