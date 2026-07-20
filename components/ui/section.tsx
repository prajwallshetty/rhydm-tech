import type { ReactNode } from "react";

import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-7xl px-6">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <FadeIn onScroll>
      <div
        className={cn(
          "max-w-2xl",
          align === "center" ? "mx-auto text-center" : "",
        )}
      >
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-widest text-brand">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </FadeIn>
  );
}
