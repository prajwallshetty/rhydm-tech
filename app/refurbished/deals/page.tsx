import type { Metadata } from "next";

import { ProductGrid } from "@/components/store/product-grid";
import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { getDeals } from "@/lib/repositories/store";

export const metadata: Metadata = {
  title: "Deals & Clearance",
  description:
    "The largest savings in the catalog — refurbished business hardware at clearance pricing, warranty included.",
  alternates: { canonical: "/refurbished/deals" },
};

export default async function DealsPage() {
  const deals = await getDeals(12);

  const [todays, rest] = [deals.slice(0, 4), deals.slice(4)];

  return (
    <>
      <PageHeader
        eyebrow="Deals"
        title="Today's best savings"
        description="Ranked by percentage saved against the original list price. Stock is limited to what we have on the shelf."
        breadcrumbs={[
          { label: "Store", href: "/refurbished" },
          { label: "Deals" },
        ]}
      />

      {/* Countdown banner — presentational only, per the brief. */}
      <div className="border-b border-border/70 bg-brand">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-4 text-center text-sm text-brand-foreground">
          <span className="font-medium">Clearance event</span>
          <span className="opacity-85">
            Prices held while stock lasts — no countdown gimmicks.
          </span>
        </div>
      </div>

      <Section>
        <SectionHeading
          eyebrow="Featured discounts"
          title="Biggest reductions"
          align="left"
        />
        <FadeIn onScroll className="mt-10">
          <ProductGrid products={todays} columns={4} />
        </FadeIn>
      </Section>

      {rest.length > 0 && (
        <Section className="border-t border-border/70 bg-muted/30">
          <SectionHeading eyebrow="Clearance" title="More reductions" align="left" />
          <div className="mt-10">
            <ProductGrid products={rest} columns={4} />
          </div>
        </Section>
      )}
    </>
  );
}
