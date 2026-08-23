import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { JsonLd } from "@/components/seo/json-ld";
import { getFaqs } from "@/lib/repositories/disposal";
import { createPageMetadata } from "@/lib/seo/metadata";
import { faqSchema, singleSchema } from "@/lib/seo/schemas";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disposal.faqs" });
  return createPageMetadata({
    locale,
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/disposal/faqs",
    keywords: ["IT Disposal FAQ", "ITAD Questions", "Data Destruction FAQ"],
  });
}

export default async function FaqsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("disposal.faqs");
  const tc = await getTranslations("disposal");
  const faqs = await getFaqs();

  return (
    <>
      <JsonLd data={singleSchema(faqSchema(faqs))} />

      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        breadcrumbs={[
          { label: tc("crumb"), href: "/disposal" },
          { label: t("crumb") },
        ]}
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <Accordion
            items={faqs.map((faq) => ({
              id: faq.id,
              question: faq.question,
              answer: faq.answer,
            }))}
          />

          <div className="mt-12 rounded-2xl border border-border/80 bg-muted/40 p-8 text-center">
            <h2 className="text-lg font-medium">{t("stillTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("stillBody")}
            </p>
            <ButtonLink href="/disposal/contact" className="mt-6">
              {t("contactCta")}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
