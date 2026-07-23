"use client";

import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Laptop, ShieldCheck } from "lucide-react";

import { rememberDivision } from "@/lib/division-preference";
import type { DivisionMeta } from "@/lib/business";
import { cn } from "@/lib/utils";

const ICONS = {
  disposal: ShieldCheck,
  refurbished: Laptop,
} as const;

type GatewayCardProps = {
  division: DivisionMeta;
  /** Stagger index for the entrance animation. */
  index: number;
};

export function GatewayCard({ division, index }: GatewayCardProps) {
  const Icon = ICONS[division.slug];
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.2 + index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className="group relative h-full flex flex-col"
      data-division={division.slug}
    >
      {/* Animated gradient border — revealed on hover/focus of the card link. */}
      <div
        aria-hidden
        className="absolute -inset-px rounded-[calc(var(--radius)+10px)] bg-linear-to-br from-brand/50 via-brand/10 to-transparent opacity-0 blur-[2px] transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
      />

      <Link
        href={division.href}
        onClick={() => rememberDivision(division.slug)}
        className={cn(
          "relative flex h-full flex-col justify-between gap-5 rounded-2xl border border-border/80 p-6 sm:p-7",
          "bg-card/80 backdrop-blur-xl",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_30px_-10px_rgba(0,0,0,0.12)]",
          "transition-[box-shadow,border-color] duration-500",
          "group-hover:border-brand/40 group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-12px_rgba(0,0,0,0.2)]",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        )}
      >
        <div className="space-y-4">
          <motion.span
            aria-hidden
            animate={
              reduceMotion ? undefined : { y: [0, -5, 0] }
            }
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.6,
            }}
            className="grid size-12 place-items-center rounded-xl bg-brand-muted text-brand ring-1 ring-brand/15"
          >
            <Icon className="size-6" strokeWidth={1.8} />
          </motion.span>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl text-slate-900 dark:text-white">
              {division.title}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {division.tagline}
            </p>
          </div>

          <ul className="grid gap-2 pt-1">
            {division.highlights.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
              >
                <Check
                  aria-hidden
                  className="size-3.5 shrink-0 text-brand"
                  strokeWidth={2.4}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <span className="inline-flex items-center gap-2 pt-1 text-xs sm:text-sm font-bold text-brand">
          {division.cta}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </Link>
    </motion.div>
  );
}
