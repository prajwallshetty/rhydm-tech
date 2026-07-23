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
                  {COMPANY.address.postalCode} {COMPANY.address.city}
                  <br />
                  {COMPANY.address.country}
                </ContactRow>

                <ContactRow icon={Clock} label="Hours">
                  Mon–Fri, 9:00–18:00 CET
                  <br />
                  Emergency collections by arrangement
                </ContactRow>
              </div>

              {/* Embedded Google Maps location */}
              <div className="h-64 overflow-hidden rounded-2xl border border-border/80 bg-muted/50">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2426.1788276739685!2d13.251739599999999!3d52.548290099999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a8577a20f0bebf%3A0xce8d066281ffb4ff!2sRhydm%20Technologies!5e0!3m2!1sen!2sin!4v1784738962842!5m2!1sen!2sin"
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
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
