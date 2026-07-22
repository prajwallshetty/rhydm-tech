import type { Metadata } from "next";

import { ItadComparison } from "@/components/disposal/itad/comparison";
import { ItadCompliance } from "@/components/disposal/itad/compliance";
import { ItadFinalCta } from "@/components/disposal/itad/final-cta";
import { ItadHero } from "@/components/disposal/itad/hero";
import { ItadLifecycle } from "@/components/disposal/itad/lifecycle";
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
  // One parallel round to the CMS — every content section below is
  // database-driven, so edits in /admin/disposal ship without a deploy.
  const [services, steps, faqs, testimonials, certifications] =
    await Promise.all([
      getServices(),
      getProcessSteps(),
      getFaqs(),
      getTestimonials(),
      getCertifications(),
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
        // Our own structured data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ItadHero />
      <ItadTrustMarquee />
      <ItadWhyBento />
      <ItadServices services={services} />
      <ItadProcess steps={steps} />
      <ItadShowcase />
      <ItadComparison />
      <ItadValueRecovery />
      <ItadCompliance certifications={certifications} />
      <ItadTestimonials testimonials={testimonials} />

      {/* FAQ */}
      <section
        className="bg-white pb-24 sm:pb-32"
        aria-labelledby="itad-faq-heading"
      >
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              FAQ
            </p>
            <h2
              id="itad-faq-heading"
              className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 text-balance sm:text-5xl"
            >
              Questions, answered
            </h2>
          </div>
          <div className="mt-12">
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

      <ItadLifecycle />
      <ItadFinalCta />
    </div>
  );
}
