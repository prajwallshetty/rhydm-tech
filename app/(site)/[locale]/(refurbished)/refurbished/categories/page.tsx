import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getCategories } from "@/lib/repositories/store";
import { CategoryListCard } from "@/components/store/category-list-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "store.pages" });
  return { title: t("categoriesMetaTitle"), description: t("categoriesMetaDescription") };
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("store.pages");
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        eyebrow={t("categoriesEyebrow")}
        title={t("categoriesTitle")}
        description={t("categoriesDescription")}
        breadcrumbs={[
          { label: t("crumbStore"), href: "/refurbished" },
          { label: t("crumbCategories") },
        ]}
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => (
            <FadeIn key={category.id} onScroll delay={i * 0.04}>
              <CategoryListCard category={category} />
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
