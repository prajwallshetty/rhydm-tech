import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Pagination } from "@/components/store/pagination";
import { ProductFilters } from "@/components/store/product-filters";
import { ProductGrid } from "@/components/store/product-grid";
import { SortSelect } from "@/components/store/sort-select";
import { PageHeader } from "@/components/ui/page-header";
import {
  getBrands,
  getCategories,
  getPriceBounds,
  getProducts,
} from "@/lib/repositories/store";
import { buildPageHref, parseFilters, type RawSearchParams } from "@/lib/search-params";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("store.pages");
  return { title: t("shopMetaTitle"), description: t("shopMetaDescription") };
}

// Next 16: searchParams is a Promise.
type Props = { searchParams: Promise<RawSearchParams> };

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const t = await getTranslations("store.pages");
  const [result, brands, categories, priceBounds] = await Promise.all([
    getProducts(filters),
    getBrands(),
    getCategories(),
    getPriceBounds(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={t("shopEyebrow")}
        title={t("shopTitle")}
        description={t("shopDescription")}
        breadcrumbs={[
          { label: t("crumbStore"), href: "/refurbished" },
          { label: t("crumbShop") },
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
            categories={categories.map((c) => ({
              value: c.slug,
              label: c.name,
              count: c._count.products,
            }))}
            priceBounds={priceBounds}
          />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
              <p className="text-sm text-muted-foreground">
                {t("productCount", { count: result.total })}
                {result.pageCount > 1 &&
                  ` · ${t("pageOf", { page: result.page, pageCount: result.pageCount })}`}
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
                    buildPageHref("/refurbished/shop", params, page)
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
