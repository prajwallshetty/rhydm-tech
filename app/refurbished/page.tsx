import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Section, SectionHeading } from "@/components/ui/section";
import { BUYING_POINTS, CATEGORIES } from "@/lib/data/store";

export default function RefurbishedHomePage() {
  return (
    <>
      {/* Hero banner */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-brand-muted/60 to-transparent"
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <FadeIn className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-brand/25 bg-brand-muted px-3 py-1 text-sm font-medium text-brand">
              12-month warranty on every device
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.05]">
              Enterprise hardware, professionally restored
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Laptops, desktops, servers and networking equipment &mdash; fully
              tested, data-sanitised and graded before they reach the catalog.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/refurbished/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
              >
                Shop All Devices
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link
                href="/refurbished/categories"
                className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Browse Categories
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Popular categories */}
      <Section>
        <SectionHeading
          eyebrow="Categories"
          title="Shop by category"
          description="Business-grade hardware, sourced from corporate refresh cycles."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, i) => (
            <FadeIn key={category.slug} onScroll delay={i * 0.05}>
              <Link
                href={`/refurbished/categories/${category.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border/80 bg-card p-7 transition-colors hover:border-brand/35"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-medium">{category.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {category.itemCount}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                  Browse
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Why buy refurbished */}
      <Section className="border-t border-border/70 bg-muted/30">
        <SectionHeading
          eyebrow="Why refurbished"
          title="The same hardware, without the premium"
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {BUYING_POINTS.map((point, i) => (
            <FadeIn key={point.title} onScroll delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border/80 bg-card p-7">
                <h3 className="text-lg font-medium">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
