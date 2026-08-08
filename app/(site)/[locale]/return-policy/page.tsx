import { getSectionContent } from "@/lib/cms/content";
import { LegalLayout } from "@/components/layout/legal-layout";
import { setRequestLocale } from "next-intl/server";
import { createPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const content = await getSectionContent<any>("site.legal.return", locale);
  return createPageMetadata({
    title: content.seoTitle || content.title,
    description: content.seoDescription,
    path: "/return-policy",
  });
}

export default async function ReturnPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSectionContent<any>("site.legal.return", locale);

  return (
    <LegalLayout
      title={content.title}
      content={content.content}
      seoTitle={content.seoTitle || content.title}
      seoDescription={content.seoDescription}
      slug="return-policy"
      locale={locale}
    />
  );
}
