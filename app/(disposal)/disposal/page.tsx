import type { Metadata } from "next";

import { ItadComparison } from "@/components/disposal/itad/comparison";
import { ItadCompliance } from "@/components/disposal/itad/compliance";
import { ItadFinalCta } from "@/components/disposal/itad/final-cta";
import { ItadHero } from "@/components/disposal/itad/hero";
import { ItadIndustries } from "@/components/disposal/itad/industries";
import { ItadProcess } from "@/components/disposal/itad/process";
import { ItadServices } from "@/components/disposal/itad/services";
import { ItadShowcase } from "@/components/disposal/itad/showcase";
import { ItadTestimonials } from "@/components/disposal/itad/testimonials";
import { ItadTrustMarquee } from "@/components/disposal/itad/trust-marquee";
import { ItadValueRecovery } from "@/components/disposal/itad/value-recovery";
import { ItadWhyBento } from "@/components/disposal/itad/why-bento";
import { Accordion } from "@/components/ui/accordion";
import { SITE_URL } from "@/lib/business";
import {
  getCertifications,
  getFaqs,
  getIndustries,
  getProcessSteps,
  getServices,
  getTestimonials,
} from "@/lib/repositories/disposal";

export const metadata: Metadata = {
  title:
    "Global IT Asset Disposition (ITAD) Services | Secure Data Destruction & Asset Recovery",
  description:
    "Secure IT Asset Disposition (ITAD) with certified data destruction, global recycling, refurbishment, resale, and audit-ready compliance across 120+ countries.",
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
  alternates: { canonical: "/disposal" },
  openGraph: {
    title: "Global IT Asset Disposition (ITAD), Simplified",
    description:
      "Securely retire, wipe, refurbish, recycle, redeploy, and recover value from IT assets across 120+ countries.",
    url: "/disposal",
  },
};

export default async function DisposalHomePage() {
  const [services, steps, faqs, testimonials, certifications, industries] =
    await Promise.all([
      getServices(),
      getProcessSteps(),
      getFaqs(),
      getTestimonials(),
      getCertifications(),
      getIndustries(),
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

      <ItadHero />
      <ItadWhyBento />
      <ItadServices services={services} />
      <ItadProcess steps={steps} />
      <ItadIndustries industries={industries} />
      <ItadComparison />
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
              FAQ
            </p>
            <h2
              id="itad-faq-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl"
            >
              Frequently Asked Questions
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

      <ItadFinalCta />
    </div>
  );
}
