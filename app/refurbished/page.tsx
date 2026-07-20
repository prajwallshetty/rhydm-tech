import Link from "next/link";
import { ArrowRight, RotateCcw, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { ProductGrid } from "@/components/store/product-grid";
import { ProductThumb } from "@/components/store/product-thumb";
import { RatingStars } from "@/components/store/rating-stars";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { FadeIn } from "@/components/motion/fade-in";
import {
  getBestSellers,
  getBrands,
  getCategories,
  getDeals,
  getFeaturedProducts,
  getStoreFaqs,
} from "@/lib/repositories/store";
import { BUYING_POINTS } from "@/lib/data/store";

export default async function RefurbishedHomePage() {
  const [featured, bestSellers, deals, categories, brands, faqs] =
    await Promise.all([
      getFeaturedProducts(4),
      getBestSellers(4),
      getDeals(3),
      getCategories(),
      getBrands(),
      getStoreFaqs(),
    ]);

  return (
    <>
      {/* Hero banner */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-brand-muted/60 to-transparent"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-muted px-3 py-1 text-sm font-medium text-brand">
              <Sparkles aria-hidden className="size-3.5" />
              12-month warranty on every device
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.05]">
              Enterprise hardware, professionally restored
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Laptops, desktops, servers and networking equipment &mdash; fully
              tested, data-sanitised and graded before they reach the catalog.
              Typically 40&ndash;60% below new.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/refurbished/shop" size="lg">
                Shop all devices
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
              <ButtonLink href="/refurbished/deals" variant="outline" size="lg">
                View deals
              </ButtonLink>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border/70 pt-8">
              <div>
                <dt className="sr-only">Products available</dt>
                <dd className="text-2xl font-semibold tracking-tight">500+</dd>
                <p className="mt-1 text-xs text-muted-foreground">
                  Units in stock
                </p>
              </div>
              <div>
                <dt className="sr-only">Testing checkpoints</dt>
                <dd className="text-2xl font-semibold tracking-tight">40</dd>
                <p className="mt-1 text-xs text-muted-foreground">
                  Point inspection
                </p>
              </div>
              <div>
                <dt className="sr-only">Return window</dt>
                <dd className="text-2xl font-semibold tracking-tight">30d</dd>
                <p className="mt-1 text-xs text-muted-foreground">
                  Returns window
                </p>
              </div>
            </dl>
          </FadeIn>

          <FadeIn delay={0.12} className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/refurbished/categories/${category.slug}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border/80 bg-card p-5 transition-colors hover:border-brand/35"
                >
                  <ProductThumb
                    slug={category.slug}
                    category={category.slug}
                    name={category.name}
                    className="absolute inset-5 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-4 left-5 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured products */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Featured"
            title="Hand-picked this week"
            align="left"
          />
          <Link
            href="/refurbished/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand"
          >
            View all
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
        <div className="mt-10">
          <ProductGrid products={featured} columns={4} />
        </div>
      </Section>

      {/* Shop by category */}
      <Section className="border-y border-border/70 bg-muted/30">
        <SectionHeading
          eyebrow="Categories"
          title="Shop by category"
          description="Business-grade hardware sourced from corporate refresh cycles."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, i) => (
            <FadeIn key={category.id} onScroll delay={i * 0.04}>
              <Link
                href={`/refurbished/categories/${category.slug}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card px-5 py-4 transition-colors hover:border-brand/35"
              >
                <span>
                  <span className="block text-sm font-medium">
                    {category.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {category._count.products} products
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </Link>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Best sellers */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Best sellers"
            title="What teams order most"
            align="left"
          />
          <Link
            href="/refurbished/shop?sort=best-selling"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand"
          >
            View all
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
        <div className="mt-10">
          <ProductGrid products={bestSellers} columns={4} />
        </div>
      </Section>

      {/* Deals strip */}
      {deals.length > 0 && (
        <Section className="border-y border-border/70 bg-muted/30">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Deals"
              title="Biggest savings right now"
              align="left"
            />
            <Link
              href="/refurbished/deals"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand"
            >
              All deals
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={deals} />
          </div>
        </Section>
      )}

      {/* Brands */}
      <Section>
        <SectionHeading
          eyebrow="Brands"
          title="Manufacturers we stock"
          description="Sourced from corporate refresh cycles and lease returns."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {brands.map((brand, i) => (
            <FadeIn key={brand.id} onScroll delay={i * 0.03}>
              <Link
                href={`/refurbished/brands/${brand.slug}`}
                className="grid h-20 place-items-center rounded-xl border border-border/80 bg-card text-sm font-semibold tracking-tight transition-colors hover:border-brand/35 hover:text-brand"
              >
                {brand.name}
              </Link>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Why buy refurbished */}
      <Section className="border-y border-border/70 bg-muted/30">
        <SectionHeading
          eyebrow="Why refurbished"
          title="The same hardware, without the premium"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BUYING_POINTS.map((point, i) => {
            // Rendered as JSX rather than called directly — invoking a
            // component as a plain function breaks in the compiled build.
            const PointIcon = [ShieldCheck, Sparkles, RotateCcw, Truck][i % 4];

            return (
            <FadeIn key={point.title} onScroll delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border/80 bg-card p-7">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-muted text-brand">
                  <PointIcon aria-hidden className="size-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-5 text-lg font-medium">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </FadeIn>
            );
          })}
        </div>
      </Section>

      {/* Customer reviews */}
      <Section>
        <SectionHeading
          eyebrow="Reviews"
          title="What buyers say"
          description="Drawn from verified purchases across the catalog."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            {
              quote:
                "Ordered six for our support team. Every one arrived immaculate and the battery reports matched what was advertised.",
              author: "Marcus Webb",
              role: "IT Manager",
            },
            {
              quote:
                "We now default to refurbished for standard desk builds. The documentation satisfied our compliance review without any back-and-forth.",
              author: "Priya Raman",
              role: "Head of IT Governance",
            },
            {
              quote:
                "Needed twelve units at short notice and they were dispatched same-day. All tested and ready to deploy.",
              author: "Elena Vasquez",
              role: "Operations Lead",
            },
          ].map((review, i) => (
            <FadeIn key={review.author} onScroll delay={i * 0.05}>
              <blockquote className="h-full rounded-2xl border border-border/80 bg-card p-7">
                <RatingStars rating={5} showCount={false} />
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <footer className="mt-5 text-sm">
                  <span className="font-medium">{review.author}</span>
                  <span className="block text-xs text-muted-foreground">
                    {review.role}
                  </span>
                </footer>
              </blockquote>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <Section className="border-t border-border/70 bg-muted/30">
          <SectionHeading eyebrow="FAQs" title="Common questions" />
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion items={faqs} />
          </div>
        </Section>
      )}

      {/* Newsletter */}
      <Section className="border-t border-border/70">
        <FadeIn onScroll>
          <div className="rounded-3xl bg-brand px-8 py-16 text-center sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-brand-foreground text-balance sm:text-4xl">
              New stock, first
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-foreground/85 text-pretty">
              Corporate returns move quickly. Get notified when matched batches
              land, before they hit the catalog.
            </p>

            <form
              className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
              // Newsletter delivery is not wired up yet.
              action="/refurbished"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@company.com"
                className="h-12 flex-1 rounded-xl border border-brand-foreground/25 bg-brand-foreground/10 px-4 text-sm text-brand-foreground outline-none placeholder:text-brand-foreground/60 focus-visible:border-brand-foreground/60"
              />
              <button
                type="submit"
                className="h-12 rounded-xl bg-background px-6 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
              >
                Notify me
              </button>
            </form>
          </div>
        </FadeIn>
      </Section>
    </>
  );
}
