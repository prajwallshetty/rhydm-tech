import type { Metadata } from "next";
import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getBrands } from "@/lib/repositories/store";

export const metadata: Metadata = {
  title: "Shop by Brand",
  description:
    "Refurbished hardware from Dell, HP, Lenovo, Apple, ASUS, Acer, Cisco and Intel.",
  alternates: { canonical: "/refurbished/brands" },
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <>
      <PageHeader
        eyebrow="Brands"
        title="Shop by brand"
        description="The manufacturers we see most often in corporate refresh cycles."
        breadcrumbs={[
          { label: "Store", href: "/refurbished" },
          { label: "Brands" },
        ]}
      />

      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand, i) => (
            <FadeIn key={brand.id} onScroll delay={i * 0.04}>
              <Link
                href={`/refurbished/brands/${brand.slug}`}
                className="group flex h-full flex-col items-center justify-center rounded-2xl border border-border/80 bg-card px-6 py-10 text-center transition-colors hover:border-brand/35"
              >
                {/* Wordmark placeholder until brand logos are uploaded. */}
                <span className="text-xl font-semibold tracking-tight transition-colors group-hover:text-brand">
                  {brand.name}
                </span>
                <span className="mt-2 text-sm text-muted-foreground">
                  {brand._count.products}{" "}
                  {brand._count.products === 1 ? "product" : "products"}
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
