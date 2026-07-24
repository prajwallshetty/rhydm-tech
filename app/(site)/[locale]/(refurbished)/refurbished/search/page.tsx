import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { EmptyProducts, ProductGrid } from "@/components/store/product-grid";
import { Pagination } from "@/components/store/pagination";
import { SortSelect } from "@/components/store/sort-select";
import { PageHeader } from "@/components/ui/page-header";
import { getProducts } from "@/lib/repositories/store";
import { buildPageHref, parseFilters, type RawSearchParams } from "@/lib/search-params";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("store.pages");
  // Search result pages carry no SEO value and can generate unbounded URLs.
  return { title: t("searchMetaTitle"), robots: { index: false, follow: true } };
}

type Props = { searchParams: Promise<RawSearchParams> };

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const term = filters.search?.trim() ?? "";

  const t = await getTranslations("store.pages");
  const result = term
    ? await getProducts(filters)
    : { items: [], total: 0, page: 1, perPage: 12, pageCount: 1 };

  return (
    <>
      <PageHeader
        eyebrow={t("searchEyebrow")}
        title={term ? t("searchTitleTerm", { term }) : t("searchTitleEmpty")}
        description={
          term
            ? t("searchMatches", { count: result.total })
            : t("searchPrompt")
        }
        breadcrumbs={[
          { label: t("crumbStore"), href: "/refurbished" },
          { label: t("crumbSearch") },
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
            title={t("nothingSearchedTitle")}
            description={t("nothingSearchedDesc")}
          />
        ) : result.total === 0 ? (
          <EmptyProducts
            title={t("noResultsTitle", { term })}
            description={t("noResultsDesc")}
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
