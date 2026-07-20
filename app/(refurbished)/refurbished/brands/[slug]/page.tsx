import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/store/pagination";
import { ProductGrid } from "@/components/store/product-grid";
import { SortSelect } from "@/components/store/sort-select";
import { PageHeader } from "@/components/ui/page-header";
import { getBrandBySlug, getBrands, getProducts } from "@/lib/repositories/store";
import { buildPageHref, parseFilters, type RawSearchParams } from "@/lib/search-params";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) return { title: "Brand not found" };

  return {
    title: `Refurbished ${brand.name} Equipment`,
    description: `Certified refurbished ${brand.name} hardware — tested, graded and warranty-backed.`,
    alternates: { canonical: `/refurbished/brands/${brand.slug}` },
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const [{ slug }, rawParams] = await Promise.all([params, searchParams]);

  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const filters = parseFilters(rawParams, { brands: [brand.slug] });
  const result = await getProducts(filters);

  return (
    <>
      <PageHeader
        eyebrow="Brand"
        title={brand.name}
        description={`Refurbished ${brand.name} hardware, tested and graded before listing.`}
        breadcrumbs={[
          { label: "Store", href: "/refurbished" },
          { label: "Brands", href: "/refurbished/brands" },
          { label: brand.name },
        ]}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
          <p className="text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? "product" : "products"}
          </p>
          <SortSelect />
        </div>

        <div className="mt-8">
          <ProductGrid products={result.items} columns={4} />
        </div>

        {result.pageCount > 1 && (
          <div className="mt-12">
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              buildHref={(page) =>
                buildPageHref(`/refurbished/brands/${brand.slug}`, rawParams, page)
              }
            />
          </div>
        )}
      </section>
    </>
  );
}
