import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/store/pagination";
import { ProductFilters } from "@/components/store/product-filters";
import { ProductGrid } from "@/components/store/product-grid";
import { SortSelect } from "@/components/store/sort-select";
import { PageHeader } from "@/components/ui/page-header";
import {
  getBrands,
  getCategories,
  getCategoryBySlug,
  getPriceBounds,
  getProducts,
} from "@/lib/repositories/store";
import { buildPageHref, parseFilters, type RawSearchParams } from "@/lib/search-params";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Category not found" };

  return {
    title: `Refurbished ${category.name}`,
    description: category.description ?? undefined,
    alternates: { canonical: `/refurbished/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, rawParams] = await Promise.all([params, searchParams]);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  // The category is fixed by the route, so it overrides any query param.
  const filters = parseFilters(rawParams, { category: category.slug });

  const [result, brands, priceBounds] = await Promise.all([
    getProducts(filters),
    getBrands(),
    getPriceBounds(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={`Refurbished ${category.name}`}
        description={category.description ?? undefined}
        breadcrumbs={[
          { label: "Store", href: "/refurbished" },
          { label: "Categories", href: "/refurbished/categories" },
          { label: category.name },
        ]}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <ProductFilters
            brands={brands.map((b) => ({
              value: b.slug,
              label: b.name,
              count: b._count.products,
            }))}
            categories={[]}
            showCategories={false}
            priceBounds={priceBounds}
          />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
              <p className="text-sm text-muted-foreground">
                {result.total} {result.total === 1 ? "product" : "products"}
              </p>
              <SortSelect />
            </div>

            <div className="mt-8">
              <ProductGrid products={result.items} />
            </div>

            {result.pageCount > 1 && (
              <div className="mt-12">
                <Pagination
                  page={result.page}
                  pageCount={result.pageCount}
                  buildHref={(page) =>
                    buildPageHref(
                      `/refurbished/categories/${category.slug}`,
                      rawParams,
                      page,
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
