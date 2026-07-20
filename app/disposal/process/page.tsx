import type { Metadata } from "next";

import { ProcessTimeline } from "@/components/disposal/process-timeline";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/motion/fade-in";
import { getProcessSteps } from "@/lib/repositories/disposal";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "From assessment and insured pickup through data wiping, physical destruction, recycling and serial-level certification.",
  alternates: { canonical: "/disposal/process" },
};

export default async function ProcessPage() {
  const steps = await getProcessSteps();

  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="Seven stages, fully documented"
        description="Every asset is tracked from collection to certificate. Nothing leaves the chain of custody unrecorded."
        breadcrumbs={[
          { label: "Disposal", href: "/disposal" },
          { label: "Process" },
        ]}
      />

      <Section>
        <ProcessTimeline steps={steps} />
      </Section>

      <Section className="border-t border-border/70">
        <FadeIn onScroll>
          <div className="rounded-3xl bg-brand px-8 py-16 text-center sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-brand-foreground text-balance sm:text-4xl">
              Start with an assessment
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-foreground/85 text-pretty">
              We scope your estate and compliance obligations before anything is
              collected.
            </p>
            <div className="mt-9 flex justify-center">
              <ButtonLink href="/disposal/contact" variant="inverse" size="lg">
                Schedule Consultation
              </ButtonLink>
            </div>
          </div>
        </FadeIn>
      </Section>
    </>
  );
}
