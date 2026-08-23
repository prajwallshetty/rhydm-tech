import { getSectionContent } from "@/lib/cms/content";
import { LegalLayout } from "@/components/layout/legal-layout";
import { setRequestLocale } from "next-intl/server";
import { createPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const content = await getSectionContent<any>("site.legal.payment", locale);
  return createPageMetadata({
    locale,
    title: content.seoTitle || content.title,
    description: content.seoDescription,
    path: "/payment-policy",
  });
}

export default async function PaymentPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSectionContent<any>("site.legal.payment", locale);

  return (
    <LegalLayout
      title={content.title}
      content={content.content}
      seoTitle={content.seoTitle || content.title}
      seoDescription={content.seoDescription}
      slug="payment-policy"
      locale={locale}
    />
  );
}
