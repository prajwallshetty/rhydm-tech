import { getSectionContent } from "@/lib/cms/content";
import { LegalLayout } from "@/components/layout/legal-layout";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const content = await getSectionContent<any>("site.legal.privacy", locale);
  return {
    title: content.seoTitle || content.title,
    description: content.seoDescription,
    alternates: {
      canonical: `https://rhydm.tech/${locale}/privacy-policy`,
      languages: {
        en: "https://rhydm.tech/en/privacy-policy",
        de: "https://rhydm.tech/de/privacy-policy",
      },
    },
  };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSectionContent<any>("site.legal.privacy", locale);

  return (
    <LegalLayout
      title={content.title}
      content={content.content}
      seoTitle={content.seoTitle || content.title}
      seoDescription={content.seoDescription}
      slug="privacy-policy"
      locale={locale}
    />
  );
}
