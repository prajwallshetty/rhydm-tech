import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Recycle,
  ShieldCheck,
  ShoppingCart,
  SpellCheck,
  Trash2,
  User,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { DisposalFloatingNav } from "@/components/disposal/disposal-floating-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { BRAND, COMPANY, SITE_URL } from "@/lib/business";
import { createPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, faqSchema, graphSchema } from "@/lib/seo/schemas";

type Props = { params: Promise<{ locale: string }> };

const PATH = "/rhydm-tech";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isDe = locale === "de";

  return createPageMetadata({
    locale,
    // Absolute: this page's whole job is to be the definitive result for the
    // brand query, so the title leads with the brand and names the company
    // rather than appending the usual "| Rhydm Tech" suffix to something else.
    title: `${BRAND} — ${COMPANY.legalName}`,
    absoluteTitle: true,
    description: isDe
      ? "Rhydm Tech ist die Technologiemarke von Rhydm Technologies in Berlin: IT-Asset-Entsorgung (ITAD), sichere Datenvernichtung, refurbished IT-Technik und Ankauf gebrauchter Hardware."
      : "Rhydm Tech is the technology brand of Rhydm Technologies, a Berlin company providing IT asset disposal, secure data destruction, refurbished technology and IT equipment trade-in across Germany.",
    path: PATH,
    keywords: [
      "Rhydm",
      "Rhydm Tech",
      "Rhydm Technologies",
      "Rhydm Tech Berlin",
      "Rhydm ITAD",
      "Rhydm refurbished",
    ],
  });
}

export default async function RhydmTechBrandPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isDe = locale === "de";

  const address = `${COMPANY.address.street}, ${COMPANY.address.postalCode} ${COMPANY.address.city}, ${COMPANY.address.country}`;

  /**
   * These answer the questions people actually type after a brand query. They
   * are also the FAQPage payload below, so the visible copy and the structured
   * data can never drift apart.
   */
  const faqs = [
    {
      id: "brand-faq-what-is",
      question: isDe ? "Was ist Rhydm Tech?" : "What is Rhydm Tech?",
      answer: isDe
        ? "Rhydm Tech ist die Technologiemarke von Rhydm Technologies, einem in Berlin ansässigen Unternehmen für IT-Asset-Entsorgung (ITAD), sichere Datenvernichtung, IT-Recycling, refurbished IT-Technik und zirkuläre IT-Lösungen."
        : "Rhydm Tech is the technology brand of Rhydm Technologies, a Berlin-based company providing IT asset disposal (ITAD), secure data destruction, IT equipment recycling, refurbished technology and circular IT solutions.",
    },
    {
      id: "brand-faq-relationship",
      question: isDe
        ? "Wie hängen Rhydm Tech und Rhydm Technologies zusammen?"
        : "How are Rhydm Tech and Rhydm Technologies related?",
      answer: isDe
        ? "Es handelt sich um dasselbe Unternehmen. Rhydm Technologies ist der vollständige Unternehmensname, Rhydm Tech ist die Marke, unter der das Unternehmen auftritt und unter rhydm-tech.com erreichbar ist."
        : "They are the same organisation. Rhydm Technologies is the full company name; Rhydm Tech is the brand it trades under and the name of its website, rhydm-tech.com.",
    },
    {
      id: "brand-faq-spelling",
      question: isDe
        ? "Wird Rhydm wie „Rhythm“ geschrieben?"
        : "Is Rhydm spelled the same as “rhythm”?",
      answer: isDe
        ? "Nein. Der Markenname wird R-H-Y-D-M geschrieben — ohne „th“ und ohne zweites „h“. Rhydm ist ein eigenständiger Markenname und keine Schreibweise des englischen Wortes „rhythm“."
        : "No. The brand is spelled R-H-Y-D-M — no “th”, and no second “h”. Rhydm is a distinct brand name, not a variant spelling of the English word “rhythm”.",
    },
    {
      id: "brand-faq-does",
      question: isDe ? "Was macht Rhydm Tech?" : "What does Rhydm Tech do?",
      answer: isDe
        ? "Rhydm Tech holt ausgemusterte IT-Hardware bei Unternehmen ab, löscht die Daten nachweisbar nach NIST SP 800-88, bereitet brauchbare Geräte auf und verkauft sie mit Garantie weiter und recycelt den Rest gemäß ElektroG und WEEE."
        : "Rhydm Tech collects retired IT hardware from businesses, sanitises the data to NIST SP 800-88 with per-drive certificates, refurbishes what can be reused and resells it with warranty, and recycles the remainder under WEEE/ElektroG rules.",
    },
    {
      id: "brand-faq-where",
      question: isDe ? "Wo befindet sich Rhydm Tech?" : "Where is Rhydm Tech based?",
      answer: isDe
        ? `Rhydm Tech hat seinen Sitz in Berlin, Deutschland: ${address}. Das Unternehmen bedient Kunden in ganz Deutschland.`
        : `Rhydm Tech is based in Berlin, Germany, at ${address}. The company serves customers across Germany.`,
    },
    {
      id: "brand-faq-services",
      question: isDe
        ? "Welche Leistungen bietet Rhydm Tech an?"
        : "What services does Rhydm Tech offer?",
      answer: isDe
        ? "IT-Asset-Entsorgung (ITAD), sichere Datenvernichtung und Festplattenvernichtung, IT- und Elektroschrott-Recycling, Ankauf und Trade-In gebrauchter IT-Hardware sowie den Verkauf geprüfter refurbished Business-Geräte."
        : "IT asset disposal (ITAD), secure data destruction and drive shredding, IT equipment and e-waste recycling, trade-in and buyback of used business hardware, and the sale of tested refurbished business equipment.",
    },
    {
      id: "brand-faq-products",
      question: isDe
        ? "Welche Produkte verkauft Rhydm Tech?"
        : "What products does Rhydm Tech sell?",
      answer: isDe
        ? "Refurbished Business-Laptops, Desktops, Server, Netzwerktechnik und Zubehör — getestet, eingestuft und mit mindestens 12 Monaten Garantie, erhältlich im Refurbished-Shop."
        : "Refurbished business laptops, desktops, servers, networking equipment and accessories — tested, graded, and backed by a minimum 12-month warranty, sold through the refurbished store.",
    },
    {
      id: "brand-faq-contact",
      question: isDe
        ? "Wie kann man Rhydm Tech kontaktieren?"
        : "How can customers contact Rhydm Tech?",
      answer: isDe
        ? `Per E-Mail an ${COMPANY.email}, telefonisch unter ${COMPANY.phone} oder über die Kontaktformulare auf rhydm-tech.com. Die Geschäftszeiten sind ${COMPANY.openingHours}.`
        : `By email at ${COMPANY.email}, by phone on ${COMPANY.phone}, or through the contact forms on rhydm-tech.com. Business hours are ${COMPANY.openingHours}.`,
    },
  ];

  const services = [
    {
      href: "/it-asset-disposal-berlin" as const,
      icon: Trash2,
      title: isDe ? "IT-Asset-Entsorgung (ITAD)" : "IT Asset Disposal (ITAD)",
      body: isDe
        ? "Abholung, Erfassung und gesetzeskonforme Stilllegung ausgemusterter Unternehmens-IT in Berlin und deutschlandweit."
        : "Collection, serialised audit and compliant decommissioning of retired corporate IT in Berlin and across Germany.",
    },
    {
      href: "/disposal/services" as const,
      icon: ShieldCheck,
      title: isDe ? "Sichere Datenvernichtung" : "Secure Data Destruction",
      body: isDe
        ? "Softwarebasierte Löschung nach NIST SP 800-88 R1 oder physische Vernichtung, jeweils mit Zertifikat je Datenträger."
        : "Software erasure to NIST SP 800-88 R1 or physical destruction, each with a per-drive certificate of sanitisation.",
    },
    {
      href: "/disposal/process" as const,
      icon: Recycle,
      title: isDe ? "IT-Recycling & Kreislauf-IT" : "IT Recycling & Circular IT",
      body: isDe
        ? "Wiederverwendung vor Verwertung: Geräte werden aufbereitet statt geschreddert, der Rest nach ElektroG recycelt."
        : "Reuse before recycling: hardware is refurbished rather than shredded, with the remainder recycled under WEEE/ElektroG.",
    },
    {
      href: "/refurbished" as const,
      icon: ShoppingCart,
      title: isDe ? "Refurbished Technik" : "Refurbished Technology",
      body: isDe
        ? "Geprüfte Business-Laptops, Desktops, Server und Netzwerktechnik mit mindestens 12 Monaten Garantie."
        : "Tested business laptops, desktops, servers and networking hardware with a minimum 12-month warranty.",
    },
    {
      href: "/refurbished/trade-in" as const,
      icon: ArrowRight,
      title: isDe ? "Trade-In & Ankauf" : "Trade-In & Buyback",
      body: isDe
        ? "Restwertermittlung für ausgemusterte Hardware — als Auszahlung oder als Guthaben für Ersatzgeräte."
        : "Value recovery on retired hardware — paid out, or credited against replacement equipment.",
    },
    {
      href: "/about" as const,
      icon: Building2,
      title: isDe ? "Über das Unternehmen" : "About the Company",
      body: isDe
        ? "Hintergrund, Zertifizierungen und Compliance-Rahmen von Rhydm Technologies."
        : "Background, certifications and the compliance framework behind Rhydm Technologies.",
    },
  ];

  const facts: { label: string; value: React.ReactNode; icon: typeof MapPin }[] = [
    {
      icon: Building2,
      label: isDe ? "Marke" : "Brand",
      value: BRAND,
    },
    {
      icon: Building2,
      label: isDe ? "Unternehmen" : "Company",
      value: COMPANY.legalName,
    },
    {
      icon: User,
      label: isDe ? "Gründer" : "Founder",
      value: (
        <Link href="/about/yash-saad" className="text-[#16A34A] hover:underline">
          Yash Saad
        </Link>
      ),
    },
    { icon: MapPin, label: isDe ? "Standort" : "Location", value: address },
    { icon: Phone, label: isDe ? "Telefon" : "Phone", value: COMPANY.phone },
    { icon: Mail, label: "E-Mail", value: COMPANY.email },
    { icon: Globe, label: isDe ? "Website" : "Website", value: "rhydm-tech.com" },
  ];

  return (
    <>
      {/*
        WebPage + FAQPage + BreadcrumbList, all bound to the single Organization
        and Brand nodes declared once in the root layout. Nothing here redefines
        the organisation — a second definition is what splits an entity.
      */}
      <JsonLd
        data={graphSchema(
          {
            "@type": "AboutPage",
            "@id": `${SITE_URL}${PATH}#webpage`,
            url: `${SITE_URL}${PATH}`,
            name: `${BRAND} — ${COMPANY.legalName}`,
            description: COMPANY.description,
            inLanguage: locale,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": `${SITE_URL}/#organization` },
            mainEntity: { "@id": `${SITE_URL}/#organization` },
            primaryImageOfPage: { "@id": `${SITE_URL}/#brand` },
          },
          faqSchema(faqs),
          breadcrumbSchema([
            { name: isDe ? "Startseite" : "Home", url: "/" },
            { name: BRAND },
          ], locale),
        )}
      />

      <div data-division="disposal" className="flex min-h-dvh flex-col bg-white">
        <DisposalFloatingNav />

        <main className="flex-1 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 space-y-16">

            {/* Hero — the brand as plain, crawlable H1 text */}
            <header className="max-w-3xl mx-auto text-center space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
                {isDe ? "Marke & Unternehmen" : "Brand & Company"}
              </p>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                {BRAND}
              </h1>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                {isDe ? (
                  <>
                    <strong>Rhydm Tech</strong> ist die Technologiemarke von{" "}
                    <strong>Rhydm Technologies</strong>, einem in Berlin
                    ansässigen Unternehmen für IT-Asset-Entsorgung, sichere
                    Datenvernichtung, refurbished IT-Technik und zirkuläre
                    IT-Lösungen in Deutschland.
                  </>
                ) : (
                  <>
                    <strong>Rhydm Tech</strong> is the technology brand of{" "}
                    <strong>Rhydm Technologies</strong>, a Berlin-based company
                    providing IT asset disposal, secure data destruction,
                    refurbished technology and circular IT solutions in Germany.
                  </>
                )}
              </p>
            </header>

            {/* Name & spelling — the Rhydm / rhythm disambiguation */}
            <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
                <SpellCheck className="size-6 text-[#16A34A]" />
                {isDe ? "Der Name: Rhydm, nicht Rhythm" : "The name: Rhydm, not rhythm"}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {isDe
                  ? "Die Marke wird R-H-Y-D-M geschrieben. Sie enthält kein „th“ und kein zweites „h“, und sie ist keine Variante des englischen Wortes „rhythm“. Wer nach Rhydm, Rhydm Tech oder Rhydm Technologies sucht, sucht nach diesem Unternehmen."
                  : "The brand is spelled R-H-Y-D-M. There is no “th” and no second “h”, and it is not a variant of the English word “rhythm”. Searches for Rhydm, Rhydm Tech or Rhydm Technologies all refer to this company."}
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { k: isDe ? "Marke" : "Brand", v: "Rhydm Tech" },
                  { k: isDe ? "Unternehmen" : "Company", v: "Rhydm Technologies" },
                  { k: isDe ? "Kurzform" : "Short form", v: "Rhydm" },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-4 py-3"
                  >
                    <dt className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      {row.k}
                    </dt>
                    <dd className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {row.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Entity fact table */}
            <section className="space-y-5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {isDe ? "Unternehmensdaten auf einen Blick" : "Company details at a glance"}
              </h2>
              <dl className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-slate-100 dark:divide-zinc-800">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-6 py-4"
                  >
                    <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 sm:w-44 shrink-0">
                      <fact.icon className="size-4 text-[#16A34A]" />
                      {fact.label}
                    </dt>
                    <dd className="text-sm font-medium text-slate-900 dark:text-white">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* What Rhydm Tech does — entity graph hub */}
            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {isDe ? "Was Rhydm Tech anbietet" : "What Rhydm Tech does"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="group rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-[#16A34A] dark:hover:border-[#16A34A] transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <service.icon className="size-4 text-[#16A34A]" />
                      {service.title}
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {service.body}
                    </span>
                    <span className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-[#16A34A] transition-colors">
                      {isDe ? "Mehr erfahren" : "Learn more"}
                      <ArrowRight className="size-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {isDe
                  ? "Häufige Fragen zu Rhydm Tech"
                  : "Common questions about Rhydm Tech"}
              </h2>
              <Accordion items={faqs} />
            </section>

            {/* Contact CTA */}
            <section className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-8 text-center space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {isDe ? "Rhydm Tech kontaktieren" : "Contact Rhydm Tech"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                {isDe
                  ? "Sprechen Sie mit uns über die Abholung ausgemusterter IT, ein Datenvernichtungs-Zertifikat oder ein Angebot für refurbished Hardware."
                  : "Talk to us about collecting retired IT, obtaining certificates of data destruction, or a quote for refurbished hardware."}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  href="/disposal/contact"
                  className="rounded-full bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#15803d] transition-colors"
                >
                  {isDe ? "Kontakt aufnehmen" : "Get in touch"}
                </Link>
                <Link
                  href="/refurbished/shop"
                  className="rounded-full border border-slate-300 dark:border-zinc-700 px-6 py-2.5 text-sm font-bold text-slate-900 dark:text-white hover:border-[#16A34A] transition-colors"
                >
                  {isDe ? "Zum Refurbished-Shop" : "Browse refurbished stock"}
                </Link>
              </div>
            </section>

          </div>
        </main>

        <SiteFooter division="disposal" />
      </div>
    </>
  );
}
