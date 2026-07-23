import type { Metadata } from "next";

import { EmptyProducts, ProductGrid } from "@/components/store/product-grid";
import { Pagination } from "@/components/store/pagination";
import { SortSelect } from "@/components/store/sort-select";
import { PageHeader } from "@/components/ui/page-header";
import { getProducts } from "@/lib/repositories/store";
import { buildPageHref, parseFilters, type RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Search",
  // Search result pages carry no SEO value and can generate unbounded URLs.
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<RawSearchParams> };

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const term = filters.search?.trim() ?? "";

  const result = term
    ? await getProducts(filters)
    : { items: [], total: 0, page: 1, perPage: 12, pageCount: 1 };

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={term ? `Results for “${term}”` : "Search the catalog"}
        description={
          term
            ? `${result.total} ${result.total === 1 ? "match" : "matches"} found.`
            : "Enter a product, brand or specification in the search bar above."
        }
        breadcrumbs={[
          { label: "Store", href: "/refurbished" },
          { label: "Search" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        {term && result.total > 0 && (
          <div className="mb-8 flex justify-end">
            <SortSelect />
          </div>
        )}

        {!term ? (
          <EmptyProducts
            title="Nothing searched yet"
            description="Use the search bar to find laptops, servers, docks and more."
          />
        ) : result.total === 0 ? (
          <EmptyProducts
            title={`No results for “${term}”`}
            description="Check the spelling, try a broader term, or browse the full catalog."
          />
        ) : (
          <>
            <ProductGrid products={result.items} />
            {result.pageCount > 1 && (
              <div className="mt-12">
                <Pagination
                  page={result.page}
                  pageCount={result.pageCount}
                  buildHref={(page) =>
                    buildPageHref("/refurbished/search", params, page)
                  }
                />
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
