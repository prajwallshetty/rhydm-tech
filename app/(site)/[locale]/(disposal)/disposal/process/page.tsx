import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ProcessTimeline } from "@/components/disposal/process-timeline";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/motion/fade-in";
import { getProcessSteps } from "@/lib/repositories/disposal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disposal.process" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("disposal.process");
  const tc = await getTranslations("disposal");
  const steps = await getProcessSteps();

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
        <ProcessTimeline steps={steps} />
      </Section>

      <Section className="border-t border-border/70">
        <FadeIn onScroll>
          <div className="rounded-3xl bg-brand px-8 py-16 text-center sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-brand-foreground text-balance sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-foreground/85 text-pretty">
              {t("ctaBody")}
            </p>
            <div className="mt-9 flex justify-center">
              <ButtonLink href="/disposal/contact" variant="inverse" size="lg">
                {t("ctaButton")}
              </ButtonLink>
            </div>
          </div>
        </FadeIn>
      </Section>
    </>
  );
}
