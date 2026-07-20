import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/disposal/contact-form";
import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { COMPANY } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact & Request Pickup",
  description:
    "Request a collection or schedule a consultation with an IT asset disposal specialist.",
  alternates: { canonical: "/disposal/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Request a pickup"
        description="Tell us roughly what you need decommissioned and we'll come back with a scope and timeline."
        breadcrumbs={[
          { label: "Disposal", href: "/disposal" },
          { label: "Contact" },
        ]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <FadeIn>
            <ContactForm />
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="space-y-8">
              <div className="space-y-5">
                <ContactRow icon={Mail} label="Email">
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="transition-colors hover:text-brand"
                  >
                    {COMPANY.email}
                  </a>
                </ContactRow>

                <ContactRow icon={Phone} label="Phone">
                  <a
                    href={`tel:${COMPANY.phone.replace(/[^+\d]/g, "")}`}
                    className="transition-colors hover:text-brand"
                  >
                    {COMPANY.phone}
                  </a>
                </ContactRow>

                <ContactRow icon={MapPin} label="Office">
                  {COMPANY.address.street}
                  <br />
                  {COMPANY.address.city}, {COMPANY.address.region}{" "}
                  {COMPANY.address.postalCode}
                </ContactRow>

                <ContactRow icon={Clock} label="Hours">
                  Mon–Fri, 8:00–18:00 CT
                  <br />
                  Emergency collections by arrangement
                </ContactRow>
              </div>

              {/* Map placeholder — swap for an embed once an API key exists.
                  Deliberately not loading a third-party iframe by default, to
                  avoid shipping trackers the user hasn't consented to. */}
              <div className="grid h-64 place-items-center rounded-2xl border border-border/80 bg-muted/50 text-center">
                <div className="px-6">
                  <MapPin
                    aria-hidden
                    className="mx-auto size-6 text-muted-foreground"
                    strokeWidth={1.6}
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Map embed placeholder
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand">
        <Icon aria-hidden className="size-4.5" strokeWidth={1.6} />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
