import { getSectionContent } from "@/lib/cms/content";
import { LegalLayout } from "@/components/layout/legal-layout";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const content = await getSectionContent<any>("site.legal.cookies", locale);
  return {
    title: content.seoTitle || content.title,
    description: content.seoDescription,
    alternates: {
      canonical: `https://rhydm.tech/${locale}/cookie-policy`,
      languages: {
        en: "https://rhydm.tech/en/cookie-policy",
        de: "https://rhydm.tech/de/cookie-policy",
      },
    },
  };
}

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSectionContent<any>("site.legal.cookies", locale);

  return (
    <LegalLayout
      title={content.title}
      content={content.content}
      seoTitle={content.seoTitle || content.title}
      seoDescription={content.seoDescription}
      slug="cookie-policy"
      locale={locale}
    />
  );
}
