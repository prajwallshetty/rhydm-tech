import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Award, FileCheck, ShieldCheck } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { getCertifications } from "@/lib/repositories/disposal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disposal.certificates" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("disposal.certificates");
  const tc = await getTranslations("disposal");

  const DOCUMENTS = [
    { icon: FileCheck, title: t("doc1Title"), description: t("doc1Desc") },
    { icon: ShieldCheck, title: t("doc2Title"), description: t("doc2Desc") },
    { icon: Award, title: t("doc3Title"), description: t("doc3Desc") },
  ];

  const certifications = await getCertifications();

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tc("crumb"), href: "/disposal" },
          { label: t("crumb") },
        ]}
      />

      <Section>
        <SectionHeading
          eyebrow={t("accreditationEyebrow")}
          title={t("accreditationTitle")}
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
          eyebrow={t("docsEyebrow")}
          title={t("docsTitle")}
          description={t("docsDescription")}
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
            {t("requestDocs")}
          </ButtonLink>
        </FadeIn>
      </Section>
    </>
  );
}
