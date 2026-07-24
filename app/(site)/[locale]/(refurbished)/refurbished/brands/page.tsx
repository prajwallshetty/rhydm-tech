import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getBrands } from "@/lib/repositories/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "store.pages" });
  return { title: t("brandsMetaTitle"), description: t("brandsMetaDescription") };
}

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("store.pages");
  const brands = await getBrands();

  return (
    <>
      <PageHeader
        eyebrow={t("brandsEyebrow")}
        title={t("brandsTitle")}
        description={t("brandsDescription")}
        breadcrumbs={[
          { label: t("crumbStore"), href: "/refurbished" },
          { label: t("crumbBrands") },
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
                  {t("productCount", { count: brand._count.products })}
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
