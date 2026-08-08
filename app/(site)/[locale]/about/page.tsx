import { getSectionContent } from "@/lib/cms/content";
import { LegalLayout } from "@/components/layout/legal-layout";
import { setRequestLocale } from "next-intl/server";
import { createPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = await getSectionContent<any>("site.legal.about", locale);
  return createPageMetadata({
    title: content.seoTitle || content.title,
    description: content.seoDescription,
    path: "/about",
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = await getSectionContent<any>("site.legal.about", locale);

  return (
    <LegalLayout
      title={content.title}
      content={content.content}
      seoTitle={content.seoTitle || content.title}
      seoDescription={content.seoDescription}
      slug="about"
      locale={locale}
    />
  );
}
