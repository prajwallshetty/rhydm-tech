import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Award, FileCheck, ShieldCheck } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { getCertifications } from "@/lib/repositories/disposal";

export const metadata: Metadata = {
  title: "Certificates & Compliance",
  description:
    "ISO 27001, ISO 14001, R2v3 and NIST 800-88 aligned processes, with serial-level certificates of destruction for every asset.",
};

const DOCUMENTS = [
  {
    icon: FileCheck,
    title: "Certificate of Destruction",
    description:
      "Issued per asset with serial number, method of destruction and date. The document auditors ask for by name.",
  },
  {
    icon: ShieldCheck,
    title: "Data Sanitisation Report",
    description:
      "Per-device erasure verification, including any media quarantined for physical destruction after a failed wipe.",
  },
  {
    icon: Award,
    title: "Environmental Impact Summary",
    description:
      "Weight recovered, diversion rate and downstream partners — formatted to drop into ESG disclosures.",
  },
];

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const certifications = await getCertifications();

  return (
    <>
      <PageHeader
        eyebrow="Certificates"
        title="Evidence, not assurances"
        description="Accreditation governs how we operate. The paperwork you receive is what proves it, years after the collection."
        breadcrumbs={[
          { label: "Disposal", href: "/disposal" },
          { label: "Certificates" },
        ]}
      />

      <Section>
        <SectionHeading
          eyebrow="Accreditation"
          title="Standards we operate to"
          align="left"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {certifications.map((cert, i) => (
            <FadeIn key={cert.id} onScroll delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border/80 bg-card p-7">
                {/* Placeholder mark until real logos are uploaded to the
                    media library and linked via Certification.logoId. */}
                <div className="grid h-16 place-items-center rounded-xl bg-muted text-sm font-semibold tracking-wide text-muted-foreground">
                  {cert.name}
                </div>
                <h2 className="mt-5 text-base font-medium">{cert.name}</h2>
                {cert.issuer && (
                  <p className="mt-1 text-xs uppercase tracking-widest text-brand">
                    {cert.issuer}
                  </p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {cert.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border/70 bg-muted/30">
        <SectionHeading
          eyebrow="Documentation"
          title="What you receive"
          description="Issued after every engagement, at the serial-number level."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {DOCUMENTS.map((doc, i) => (
            <FadeIn key={doc.title} onScroll delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border/80 bg-card p-7">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-muted text-brand">
                  <doc.icon aria-hidden className="size-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-5 text-lg font-medium">{doc.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {doc.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn onScroll className="mt-12 text-center">
          <ButtonLink href="/disposal/contact" size="lg">
            Request Sample Documentation
          </ButtonLink>
        </FadeIn>
      </Section>
    </>
  );
}
