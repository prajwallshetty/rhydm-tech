import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getIndustries } from "@/lib/repositories/disposal";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "IT asset disposal for healthcare, education, government, banking, corporate, IT and manufacturing organisations.",
};

/** Sector-specific context; the CMS `description` overrides these when set. */
const CONTEXT: Record<string, string> = {
  healthcare: "PHI-bearing media handled under HIPAA retention requirements.",
  education: "Bulk lab and campus refreshes scheduled around term dates.",
  government: "Chain-of-custody documentation suitable for public audit.",
  banking: "Destruction evidence aligned to SOX and regulator expectations.",
  corporate: "Multi-site refresh cycles consolidated into one engagement.",
  "it-companies": "High-volume estates with rapid hardware turnover.",
  manufacturing: "OT and industrial equipment alongside standard IT assets.",
};

export default async function IndustriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const industries = await getIndustries();

  return (
    <>
      <PageHeader
        eyebrow="Industries"
        title="Trusted across regulated sectors"
        description="Different regulators, different evidence requirements. We adapt the documentation to whichever framework you answer to."
        breadcrumbs={[
          { label: "Disposal", href: "/disposal" },
          { label: "Industries" },
        ]}
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, i) => (
            <FadeIn key={industry.id} onScroll delay={i * 0.04}>
              <div className="h-full rounded-2xl border border-border/80 bg-card p-7 transition-colors hover:border-brand/35">
                <h2 className="text-lg font-medium">{industry.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {industry.description ?? CONTEXT[industry.slug] ?? ""}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
