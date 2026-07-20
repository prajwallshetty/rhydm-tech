import type { Metadata } from "next";

import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { SITE_URL } from "@/lib/business";
import { getFaqs } from "@/lib/repositories/disposal";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Common questions about collection times, documentation, on-site destruction and multi-site engagements.",
  alternates: { canonical: "/disposal/faqs" },
};

export default async function FaqsPage() {
  const faqs = await getFaqs();

  // FAQPage structured data makes these eligible for rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/disposal/faqs`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Content is our own CMS data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="FAQs"
        title="Questions we're asked most"
        breadcrumbs={[
          { label: "Disposal", href: "/disposal" },
          { label: "FAQs" },
        ]}
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <Accordion
            items={faqs.map((faq) => ({
              id: faq.id,
              question: faq.question,
              answer: faq.answer,
            }))}
          />

          <div className="mt-12 rounded-2xl border border-border/80 bg-muted/40 p-8 text-center">
            <h2 className="text-lg font-medium">Still have a question?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Speak to a specialist about your estate and compliance needs.
            </p>
            <ButtonLink href="/disposal/contact" className="mt-6">
              Contact Us
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
