import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getServices } from "@/lib/repositories/disposal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disposal.services" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("disposal.services");
  const tc = await getTranslations("disposal");
  const services = await getServices();

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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <FadeIn key={service.id} onScroll delay={i * 0.04}>
              <Link
                href={`/disposal/services/${service.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border/80 bg-card p-7 transition-colors hover:border-brand/35"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-brand-muted text-brand">
                  <Icon name={service.icon} className="size-5" />
                </span>
                <h2 className="mt-5 text-lg font-medium">{service.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                  {t("learnMore")}
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
