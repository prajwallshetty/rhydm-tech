import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getCategories } from "@/lib/repositories/store";
import { CategoryListCard } from "@/components/store/category-list-card";

export const metadata: Metadata = {
  title: "Shop by Category",
  description:
    "Browse refurbished laptops, desktops, servers, networking, monitors, storage, components and accessories.",
};

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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
              <CategoryListCard category={category} />
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
