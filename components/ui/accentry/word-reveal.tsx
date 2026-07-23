import { cn } from "@/lib/utils";

interface WordRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

/**
 * Per-word staggered reveal, CSS-driven for the same LCP reason as
 * BlurReveal — the heading paints (mid-animation) before hydration instead
 * of waiting for it.
 */
export function WordReveal({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.04,
  as: Component = "div",
}: WordRevealProps) {
  const words = text.split(" ");

  return (
    <Component className={cn("inline-flex flex-wrap gap-x-[0.25em] gap-y-1", className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={cn("animate-reveal inline-block", wordClassName)}
          style={
            {
              "--reveal-delay": `${delay + i * stagger}s`,
              "--reveal-duration": "0.5s",
              "--reveal-y": "12px",
              "--reveal-blur": "4px",
            } as React.CSSProperties
          }
        >
          {word}
        </span>
      ))}
    </Component>
  );
}
