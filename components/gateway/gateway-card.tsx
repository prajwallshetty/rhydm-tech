"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Laptop, ShieldCheck } from "lucide-react";

import { rememberDivision } from "@/lib/division-preference";
import type { DivisionMeta } from "@/lib/business";
import { cn } from "@/lib/utils";

/**
 * Icons are resolved here rather than passed as props — the gateway page is a
 * Server Component and React components are not serializable across that
 * boundary.
 */
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 0.25 + index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className="group relative h-full"
      data-division={division.slug}
    >
      {/* Animated gradient border — revealed on hover/focus of the card link. */}
      <div
        aria-hidden
        className="absolute -inset-px rounded-[calc(var(--radius)+12px)] bg-linear-to-br from-brand/60 via-brand/10 to-transparent opacity-0 blur-[2px] transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
      />

      <Link
        href={division.href}
        onClick={() => rememberDivision(division.slug)}
        className={cn(
          "relative flex h-full flex-col gap-8 rounded-2xl border border-border/80 p-8 sm:p-10",
          "bg-card/70 backdrop-blur-xl",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)]",
          "transition-[box-shadow,border-color] duration-500",
          "group-hover:border-brand/40 group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-16px_rgba(0,0,0,0.22)]",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        )}
      >
        <motion.span
          aria-hidden
          animate={
            reduceMotion ? undefined : { y: [0, -7, 0] }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.6,
          }}
          className="grid size-14 place-items-center rounded-2xl bg-brand-muted text-brand ring-1 ring-brand/15"
        >
          <Icon className="size-7" strokeWidth={1.6} />
        </motion.span>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
            {division.title}
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {division.tagline}
          </p>
        </div>

        <ul className="grid gap-2.5">
          {division.highlights.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-sm text-muted-foreground"
            >
              <Check
                aria-hidden
                className="size-4 shrink-0 text-brand"
                strokeWidth={2.4}
              />
              {item}
            </li>
          ))}
        </ul>

        {/* Visual CTA only — the whole card is the interactive element, so
            nesting a real button here would duplicate the tab stop. */}
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[15px] font-medium text-brand">
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
