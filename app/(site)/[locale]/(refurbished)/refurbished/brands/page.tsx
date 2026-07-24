import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getBrands } from "@/lib/repositories/store";
import { BrandsClient } from "./brands-client";

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
        <BrandsClient
          brands={brands}
          searchPlaceholder="Search brands (Apple, Dell, HP...)"
          noResultsText="No matching brands found."
          productCountText="products"
        />
      </Section>
    </>
  );
}
