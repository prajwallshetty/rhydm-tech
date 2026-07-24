import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getIndustries } from "@/lib/repositories/disposal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disposal.industries" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function IndustriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("disposal.industries");
  const tc = await getTranslations("disposal");

  // Sector-specific fallback context; the CMS `description` overrides these
  // when set. Keyed as `ctx_<slug>` in the disposal.industries namespace.
  const industries = await getIndustries();
  const context = (slug: string) =>
    t.has(`ctx_${slug}`) ? t(`ctx_${slug}`) : "";

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tc("crumb"), href: "/disposal" },
          { label: t("crumb") },
        ]}
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, i) => (
            <FadeIn key={industry.id} onScroll delay={i * 0.04}>
              <div className="h-full rounded-2xl border border-border/80 bg-card p-7 transition-colors hover:border-brand/35">
                <h2 className="text-lg font-medium">{industry.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {industry.description ?? context(industry.slug)}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
