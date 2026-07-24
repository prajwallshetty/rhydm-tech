import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { SITE_URL } from "@/lib/business";
import { getFaqs } from "@/lib/repositories/disposal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disposal.faqs" });
  return { title: t("metaTitle"), description: t("metaDescription") };
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

  // FAQPage structured data makes these eligible for rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/disposal/faqs`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Content is our own CMS data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
