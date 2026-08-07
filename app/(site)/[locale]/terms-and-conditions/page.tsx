import { getSectionContent } from "@/lib/cms/content";
import { LegalLayout } from "@/components/layout/legal-layout";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const content = await getSectionContent<any>("site.legal.terms", locale);
  return {
    title: content.seoTitle || content.title,
    description: content.seoDescription,
    alternates: {
      canonical: `https://rhydm.tech/${locale}/terms-and-conditions`,
      languages: {
        en: "https://rhydm.tech/en/terms-and-conditions",
        de: "https://rhydm.tech/de/terms-and-conditions",
      },
    },
  };
}

export default async function TermsConditionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSectionContent<any>("site.legal.terms", locale);

  return (
    <LegalLayout
      title={content.title}
      content={content.content}
      seoTitle={content.seoTitle || content.title}
      seoDescription={content.seoDescription}
      slug="terms-and-conditions"
      locale={locale}
    />
  );
}
