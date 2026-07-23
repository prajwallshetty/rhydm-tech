import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icon";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/motion/fade-in";
import {
  getServiceBySlug,
  getServiceSlugs,
  getServices,
} from "@/lib/repositories/disposal";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Prerender every published service at build time. */
export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Next 16: params is a Promise — sync access was removed.
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const service = await getServiceBySlug(slug);

  if (!service) {
    const t = await getTranslations({ locale, namespace: "disposal.serviceDetail" });
    return { title: t("notFound") };
  }

  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/disposal/services/${service.slug}` },
    openGraph: {
      title: service.title,
      description: service.summary,
      url: `/disposal/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [service, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
  ]);

  if (!service) notFound();

  const t = await getTranslations("disposal.serviceDetail");
  const tc = await getTranslations("disposal");
  const related = allServices.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={service.title}
        description={service.summary}
        breadcrumbs={[
          { label: tc("crumb"), href: "/disposal" },
          { label: t("crumbServices"), href: "/disposal/services" },
          { label: service.title },
        ]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <FadeIn>
            <div className="max-w-2xl">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-muted text-brand">
                <Icon name={service.icon} className="size-6" />
              </span>

              <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted-foreground">
                {service.body ? (
                  service.body
                    .split("\n\n")
                    .map((paragraph, i) => <p key={i}>{paragraph}</p>)
                ) : (
                  <>
                    <p>{service.summary}</p>
                    <p>{t("auditLine")}</p>
                    <p>{t("cmsNote")}</p>
                  </>
                )}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/disposal/contact" size="lg">
                  {t("requestPickup")}
                </ButtonLink>
                <ButtonLink
                  href="/disposal/process"
                  variant="outline"
                  size="lg"
                >
                  {t("seeProcess")}
                </ButtonLink>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <aside className="rounded-2xl border border-border/80 bg-card p-7">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {t("otherServices")}
              </h2>
              <ul className="mt-5 space-y-4">
                {related.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`/disposal/services/${item.slug}`}
                      className="group flex items-start gap-3"
                    >
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-muted text-brand">
                        <Icon name={item.icon} className="size-4" />
                      </span>
                      <span className="text-sm font-medium transition-colors group-hover:text-brand">
                        {item.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}
