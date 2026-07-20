import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { FadeIn } from "@/components/motion/fade-in";
import { Section, SectionHeading } from "@/components/ui/section";
import { FEATURES, STATS } from "@/lib/data/disposal";
import { getIndustries, getServices } from "@/lib/repositories/disposal";

export default async function DisposalHomePage() {
  // Fetched in parallel — awaiting sequentially would serialise two round
  // trips for no reason.
  const [services, industries] = await Promise.all([
    getServices(),
    getIndustries(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-brand-muted/60 to-transparent"
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <FadeIn className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-brand/25 bg-brand-muted px-3 py-1 text-sm font-medium text-brand">
              ISO 27001 &middot; R2 Certified
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.05]">
              Retire IT assets without inheriting the risk
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Secure data wiping, certified destruction and zero-landfill
              recycling &mdash; delivered with the audit trail your compliance
              team actually needs.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/disposal/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
              >
                Request Pickup
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link
                href="/disposal/services"
                className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Explore Services
              </Link>
            </div>
          </FadeIn>

          {/* Statistics */}
          <FadeIn delay={0.15} className="mt-20">
            <dl className="grid grid-cols-2 gap-8 border-t border-border/70 pt-10 lg:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {stat.value}
                  </dd>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>
      </section>

      {/* Why choose us */}
      <Section>
        <SectionHeading
          eyebrow="Why choose us"
          title="Built for regulated enterprises"
          description="Every engagement is designed around evidence — so you can prove what happened to each asset, years later."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} onScroll delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border/80 bg-card p-7 transition-colors hover:border-brand/35">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-muted text-brand">
                  <Icon name={feature.icon} className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Services */}
      <Section className="border-y border-border/70 bg-muted/30">
        <SectionHeading
          eyebrow="Services"
          title="Everything the decommission requires"
          description="Engage a single service or hand over the entire lifecycle."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <FadeIn key={service.id} onScroll delay={i * 0.04}>
              <div className="group flex h-full flex-col rounded-2xl border border-border/80 bg-card p-7 transition-colors hover:border-brand/35">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-muted text-brand">
                  <Icon name={service.icon} className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-medium">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.summary}
                </p>
                <Link
                  href={`/disposal/services/${service.slug}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand"
                >
                  Learn More
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Industries */}
      <Section>
        <SectionHeading
          eyebrow="Industries"
          title="Trusted across regulated sectors"
        />
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {industries.map((industry, i) => (
            <FadeIn key={industry.id} onScroll delay={i * 0.04}>
              <div className="rounded-xl border border-border/80 bg-card px-5 py-6 text-center text-sm font-medium">
                {industry.name}
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Closing CTA */}
      <Section className="border-t border-border/70">
        <FadeIn onScroll>
          <div className="relative overflow-hidden rounded-3xl bg-brand px-8 py-16 text-center sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-brand-foreground text-balance sm:text-4xl">
              Ready to decommission with confidence?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-foreground/85 text-pretty">
              Book a pickup or talk through your compliance requirements with a
              specialist.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/disposal/contact"
                className="inline-flex items-center justify-center rounded-xl bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
              >
                Request Pickup
              </Link>
              <Link
                href="/disposal/contact"
                className="inline-flex items-center justify-center rounded-xl border border-brand-foreground/30 px-6 py-3.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-foreground/10"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>
        </FadeIn>
      </Section>
    </>
  );
}
