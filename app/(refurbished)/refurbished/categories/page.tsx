import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductThumb } from "@/components/store/product-thumb";
import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getCategories } from "@/lib/repositories/store";

export const metadata: Metadata = {
  title: "Shop by Category",
  description:
    "Browse refurbished laptops, desktops, servers, networking, monitors, storage, components and accessories.",
  alternates: { canonical: "/refurbished/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        eyebrow="Categories"
        title="Shop by category"
        description="Business-grade hardware sourced from corporate refresh cycles and lease returns."
        breadcrumbs={[
          { label: "Store", href: "/refurbished" },
          { label: "Categories" },
        ]}
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => (
            <FadeIn key={category.id} onScroll delay={i * 0.04}>
              <Link
                href={`/refurbished/categories/${category.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:border-brand/35 hover:shadow-[0_18px_48px_-20px_rgba(0,0,0,0.22)]"
              >
                <div className="relative aspect-[16/9] bg-muted/40 p-6">
                  <ProductThumb
                    slug={category.slug}
                    category={category.slug}
                    name={category.name}
                    className="absolute inset-6 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-lg font-medium">{category.name}</h2>
                    <span className="text-sm text-muted-foreground">
                      {category._count.products}
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
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
