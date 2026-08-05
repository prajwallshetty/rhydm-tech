import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { SupportClient } from "./support-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Customer Support — Rhydm Refurbished",
    description: "Get assistance with your order, returns, shipping, or warranty claims.",
  };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        eyebrow="Help Center"
        title="Customer support"
        description="We are here to help you get the most out of your hardware. Browse our FAQs or contact our dedicated support team."
        breadcrumbs={[
          { label: "Store", href: "/refurbished" },
          { label: "Support" },
        ]}
      />

      <Section>
        <SupportClient />
      </Section>
    </>
  );
}
