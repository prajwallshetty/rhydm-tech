import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ItadComparison } from "@/components/disposal/itad/comparison";
import { ItadCompliance } from "@/components/disposal/itad/compliance";
import { ItadFinalCta } from "@/components/disposal/itad/final-cta";
import { ItadHero } from "@/components/disposal/itad/hero";
import { ItadIndustries } from "@/components/disposal/itad/industries";
import { ItadProcess } from "@/components/disposal/itad/process";
import { ItadServices } from "@/components/disposal/itad/services";
import { ItadTestimonials } from "@/components/disposal/itad/testimonials";
import { ItadWhyBento } from "@/components/disposal/itad/why-bento";
import { Accordion } from "@/components/ui/accordion";
import { SITE_URL } from "@/lib/business";
import { getSectionContent } from "@/lib/cms/content";
import type {
  DisposalComparisonContent,
  DisposalFinalCtaContent,
  DisposalHeroContent,
  DisposalWhyContent,
} from "@/lib/cms/registry";
import {
  getFaqs,
  getIndustries,
  getProcessSteps,
  getServices,
  getTestimonials,
} from "@/lib/repositories/disposal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disposal.home" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: [
      "IT Asset Disposition",
      "ITAD",
      "IT Asset Disposal",
      "Data Destruction",
      "Secure Data Wiping",
      "Enterprise ITAD",
      "Global ITAD",
      "IT Lifecycle Management",
      "Asset Recovery",
      "E-Waste Recycling",
    ],
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: "/disposal",
    },
  };
}

export default async function DisposalHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("disposal.home");

  // Structured content (services, steps, …) and free-form section copy are
  // both CMS-driven — fetched in one parallel round.
  const [
    services,
    steps,
    faqs,
    testimonials,
    industries,
    heroContent,
    whyContent,
    comparisonContent,
    finalCtaContent,
  ] = await Promise.all([
    getServices(),
    getProcessSteps(),
    getFaqs(),
    getTestimonials(),
    getIndustries(),
    getSectionContent<DisposalHeroContent>("section.disposal.hero", locale),
    getSectionContent<DisposalWhyContent>("section.disposal.why", locale),
    getSectionContent<DisposalComparisonContent>("section.disposal.comparison", locale),
    getSectionContent<DisposalFinalCtaContent>("section.disposal.finalCta", locale),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/disposal`,
    name: "Global IT Asset Disposition (ITAD)",
    serviceType: "IT Asset Disposition",
    areaServed: "Worldwide",
    description:
      "Certified data destruction, global recycling, refurbishment, resale, and audit-ready compliance for enterprise IT estates.",
    provider: { "@type": "Organization", name: "Rhydm Tech", url: SITE_URL },
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ItadHero content={heroContent} />
      <ItadWhyBento content={whyContent} />
      <ItadServices services={services} />
      <ItadProcess steps={steps} />
      <ItadIndustries industries={industries} />
      <ItadComparison content={comparisonContent} />
      <ItadCompliance />
      <ItadTestimonials testimonials={testimonials} />

      {/* FAQ */}
      <section
        className="bg-white py-24 sm:py-32"
        aria-labelledby="itad-faq-heading"
      >
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
              {t("faqEyebrow")}
            </p>
            <h2
              id="itad-faq-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl"
            >
              {t("faqTitle")}
            </h2>
          </div>
          <div className="mt-14">
            <Accordion
              items={faqs.map((faq) => ({
                id: faq.id,
                question: faq.question,
                answer: faq.answer,
              }))}
            />
          </div>
        </div>
      </section>

      <ItadFinalCta content={finalCtaContent} />
    </div>
  );
}
