import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getServices } from "@/lib/repositories/disposal";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Secure data wiping, hard drive destruction, IT asset disposal, e-waste recycling, corporate pickup, asset recovery and certificates of destruction.",
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const services = await getServices();

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Everything the decommission requires"
        description="Engage a single service or hand over the entire asset lifecycle. Every option produces the same audit-grade documentation."
        breadcrumbs={[
          { label: "Disposal", href: "/disposal" },
          { label: "Services" },
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
                  Learn More
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
