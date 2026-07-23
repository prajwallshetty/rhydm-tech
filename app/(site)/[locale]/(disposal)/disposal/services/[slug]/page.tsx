import type { Metadata } from "next";
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

type Props = { params: Promise<{ slug: string }> };

/** Prerender every published service at build time. */
export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Next 16: params is a Promise — sync access was removed.
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) return { title: "Service not found" };

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
  const { slug } = await params;

  const [service, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
  ]);

  if (!service) notFound();

  const related = allServices.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="Service"
        title={service.title}
        description={service.summary}
        breadcrumbs={[
          { label: "Disposal", href: "/disposal" },
          { label: "Services", href: "/disposal/services" },
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
                    <p>
                      Every engagement produces a serial-level audit record, so
                      you can demonstrate exactly what happened to each asset —
                      not just that a process was followed.
                    </p>
                    <p>
                      Detailed content for this service is managed in the
                      Disposal CMS and will appear here once published.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/disposal/contact" size="lg">
                  Request Pickup
                </ButtonLink>
                <ButtonLink
                  href="/disposal/process"
                  variant="outline"
                  size="lg"
                >
                  See Our Process
                </ButtonLink>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <aside className="rounded-2xl border border-border/80 bg-card p-7">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Other services
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
