import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import { localBusinessSchema, faqSchema } from "@/lib/seo/schemas";
import { JsonLd } from "@/components/seo/json-ld";
import { DisposalFloatingNav } from "@/components/disposal/disposal-floating-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Accordion } from "@/components/ui/accordion";
import { ShieldCheck, Truck, ShieldAlert, Award, FileSpreadsheet, RotateCcw, ArrowRight } from "lucide-react";
import { COMPANY } from "@/lib/business";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    title: locale === "de" ? "IT Asset Disposal Berlin | Zertifizierte ITAD Deutschland" : "IT Asset Disposal Berlin | Certified ITAD Germany",
    description: locale === "de"
      ? "Sichere IT-Asset-Disposition (ITAD) für Berliner Unternehmen. Zertifizierte Datenlöschung (NIST 800-88), WEEE-Recycling und Ankauf gebrauchter IT."
      : "Secure IT Asset Disposition (ITAD) for Berlin businesses. Certified media sanitization (NIST 800-88), WEEE recycling, and corporate IT buybacks.",
    path: "/it-asset-disposal-berlin",
  });
}

export default async function ItadBerlinLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isDe = locale === "de";

  const faqs = [
    {
      id: "faq-1",
      question: isDe ? "Was bedeutet ITAD und warum ist es wichtig?" : "What does ITAD mean and why is it important?",
      answer: isDe
        ? "ITAD steht für IT Asset Disposition. Es beschreibt den sicheren, rechtskonformen Prozess des Deinstallierens, Datenlöschens, Aufarbeitens oder Recycelns ausgemusterter IT-Geräte wie Laptops, Server und Switches, um Datenschutzverletzungen (DSGVO) und Elektroschrott zu verhindern."
        : "ITAD stands for IT Asset Disposition. It refers to the safe, secure, and compliant decommissioning, data sanitization, refurbishing, or recycling of retired IT hardware like laptops, servers, and switches to prevent data breaches and environmental waste.",
    },
    {
      id: "faq-2",
      question: isDe ? "Ist eine Datenlöschung nach NIST 800-88 zertifiziert?" : "Is the data erasure certified under NIST 800-88?",
      answer: isDe
        ? "Ja, Rhydm Tech nutzt professionelle, zertifizierte Löschsoftware, die den NIST SP 800-88 R1 Richtlinien entspricht. Sie erhalten für jedes einzelne Laufwerk (HDD oder SSD) ein individuelles, manipulationssicheres Datenlöschungszertifikat."
        : "Yes, Rhydm Tech uses professional, certified software overwriting tools that conform strictly to the NIST SP 800-88 R1 standard. We provide individual, tamper-proof Certificates of Destruction linked to each drive's serial number.",
    },
    {
      id: "faq-3",
      question: isDe ? "Bietet Rhydm Tech einen sicheren Transport in Berlin an?" : "Does Rhydm Tech provide secure transport in Berlin?",
      answer: isDe
        ? "Ja, wir nutzen abschließbare Sicherheitsbehälter für den Transport. Unser geschultes Personal übernimmt die Abholung in allen Berliner Bezirken und führt auf Wunsch auch eine mobile Festplattenschredderung direkt vor Ort durch."
        : "Yes, we utilize locked, tamper-evident security bins for transit. Our vetted logistics team manages pickups across all Berlin districts, and we offer on-site mobile drive shredding upon request.",
    },
    {
      id: "faq-4",
      question: isDe ? "Können wir durch den Verkauf von Altgeräten Kapital zurückgewinnen?" : "Can we recover value from our retired IT equipment?",
      answer: isDe
        ? "Ja, voll funktionsfähige office-Laptops (Lenovo ThinkPad, HP, Dell) oder Server können aufgearbeitet (refurbished) und weiterverkauft werden. Wir bieten faire Ankaufskonditionen oder verrechnen den Wert als Guthaben für neue Geräte."
        : "Yes, functional office laptops (Lenovo ThinkPad, HP, Dell) or data center servers can be refurbished and resold. We offer competitive buyback values or apply the value as trade-in credits toward upgraded equipment.",
    },
  ];

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={localBusinessSchema()} />
      
      <div data-division="disposal" className="flex min-h-dvh flex-col bg-white">
        <DisposalFloatingNav />

        <main className="flex-1 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50">
          
          {/* Hero Section */}
          <section className="bg-slate-900 text-white py-20 lg:py-28 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-8 space-y-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  {isDe ? "Zertifizierter ITAD-Service in Berlin" : "Certified ITAD Services in Berlin"}
                </span>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
                  {isDe ? "Sichere IT-Asset-Disposition & Recycling in Berlin" : "Secure IT Asset Disposition & Recycling in Berlin"}
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {isDe
                    ? "Rhydm Tech ist ein in Berlin ansässiges Technologieunternehmen, das sich auf IT-Asset-Disposition (ITAD), sichere Datenvernichtung, zirkuläre IT-Lösungen und hochwertige generalüberholte IT-Geräte spezialisiert hat."
                    : "Rhydm Tech is a Berlin-based company providing IT asset disposal, secure data destruction, refurbished technology, IT equipment recycling, trade-in/value recovery, and circular IT solutions."}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    href="/disposal/contact"
                    className="rounded-full bg-[#16A34A] hover:bg-[#15803d] px-6 py-3 text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>{isDe ? "Jetzt Angebot anfordern" : "Get a Quote Now"}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/about"
                    className="rounded-full border border-slate-700 hover:border-white px-6 py-3 text-xs font-bold text-slate-300 hover:text-white transition-all"
                  >
                    {isDe ? "Mehr über uns" : "Learn More"}
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_40%)]" />
          </section>

          {/* Section: What is ITAD & Why is it needed */}
          <section className="py-20 bg-white dark:bg-zinc-900">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
              <div className="max-w-3xl space-y-4">
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-slate-900 dark:text-white">
                  {isDe ? "Was ist ITAD und warum benötigen Berliner Unternehmen diesen Service?" : "What Is ITAD and Why Do Berlin Businesses Need It?"}
                </h2>
                <p className="text-xs leading-relaxed text-slate-500">
                  {isDe
                    ? "IT-Asset-Disposition (ITAD) beschreibt die professionelle Entsorgung und Aufbereitung ausgemusterter IT-Geräte. Für Unternehmen in Berlin—von schnell wachsenden Start-ups in Kreuzberg bis hin zu etablierten Kanzleien und Behörden in Mitte—stehen dabei Datenschutz, rechtliche Absicherung und Ressourcenschonung im Vordergrund. Der sorglose Umgang mit alten Festplatten kann unter der DSGVO zu empfindlichen Bußgeldern führen."
                    : "IT Asset Disposition (ITAD) refers to the process of safely decommissioning, clearing data, recycling, or selling enterprise IT hardware. For businesses in Berlin—ranging from fast-growing startups in Kreuzberg to corporate headquarters in Mitte—data security, regulatory compliance, and carbon footprint reduction are paramount. Careless disposal of storage drives represents a massive legal liability under GDPR."}
                </p>
              </div>

              {/* Grid of Core Processes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4 bg-slate-50 dark:bg-zinc-950">
                  <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-[#16A34A] flex items-center justify-center">
                    <Truck className="size-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isDe ? "Sicherer Abtransport" : "Secure Pickup & Logistics"}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    {isDe
                      ? "Abholung direkt an Ihrem Standort in Berlin. Einsatz verschlossener Rollcontainer und GPS-überwachter Fahrzeuge gewährleistet lückenlose Transportsicherheit."
                      : "Direct pickup at your office in Berlin. Locked transport bins and GPS-tracked logistics assure strict chain of custody from your facility to our center."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4 bg-slate-50 dark:bg-zinc-950">
                  <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-[#16A34A] flex items-center justify-center">
                    <ShieldCheck className="size-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isDe ? "Zertifizierte Datenlöschung" : "Certified Media Sanitization"}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    {isDe
                      ? "Löschung aller Speichermedien nach NIST SP 800-88 R1 oder physikalische Vernichtung. Jedes Laufwerk erhält ein detailliertes Löschzertifikat."
                      : "Drives are sanitized conforming to NIST SP 800-88 standards or physically shredded. You receive an individual Certificate of Destruction matching drive serial numbers."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4 bg-slate-50 dark:bg-zinc-950">
                  <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-[#16A34A] flex items-center justify-center">
                    <RotateCcw className="size-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isDe ? "Wertrückgewinnung (Buyback)" : "Value Recovery & Trade-In"}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    {isDe
                      ? "Erhalten Sie attraktive Rückkaufswerte für funktionstüchtige Server und Laptops oder verrechnen Sie diese als Guthaben für zirkuläre Upgrades."
                      : "Reclaim asset capital. Functional servers and laptops are refurbished for resale, and buyback credits are applied toward sustainable upgrades."}
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* Section: Market Specifics */}
          <section className="py-20 bg-slate-50 dark:bg-zinc-950">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {isDe ? "Lösungen für jedes Berliner Marktsegment" : "ITAD Solutions for All Berlin Businesses"}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isDe
                    ? "Egal ob Data Center Decommissioning, flexible Abholungen für Co-Working Start-ups oder Großkunden-SLA: wir bieten maßgeschneiderte Konzepte."
                    : "Whether managing hyperscale data center decommissioning, flexible options for co-working startups, or enterprise SLAs, we scale to match."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">{isDe ? "Enterprise & Konzerne" : "Enterprise ITAD"}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {isDe
                      ? "Regelmäßige Rollouts, lückenlose Seriennummern-Protokolle, direkte API-Inventarübermittlung und lückenloser Entsorgungsnachweis nach ElektroG."
                      : "Regular rollout cycles, strict serial number logs, direct inventory reporting, and full waste compliance documentation."}
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">{isDe ? "Startups & Co-Working" : "Startup Lifecycle"}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {isDe
                      ? "Schnelle Abwicklung, unkomplizierter Ankauf von Mitarbeiterlaptops (ThinkPads, MacBooks) zur Budgetschonung und einfache Abholung vor Ort."
                      : "Fast processing, flexible collections, and simple laptop trade-in credits (ThinkPads, MacBooks) to minimize budget overhead."}
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">{isDe ? "Rechenzentren" : "Data Center Decommissioning"}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {isDe
                      ? "Deinstallation vor Ort, Wiping von SAN-Speichersystemen, Ausbau von Server-Racks und fachgerechtes Recycling von Netzteilen und USV-Anlagen."
                      : "On-site decommissioning, SAN sanitization, server rack extraction, and legal recycling of power supplies and network systems."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 bg-white dark:bg-zinc-900">
            <div className="mx-auto max-w-3xl px-6 lg:px-8 space-y-12">
              <div className="text-center space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A]">FAQ</p>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {isDe ? "Häufig gestellte Fragen zu ITAD in Berlin" : "Frequently Asked Questions About ITAD in Berlin"}
                </h2>
              </div>

              <Accordion
                items={faqs.map((faq) => ({
                  id: faq.id,
                  question: faq.question,
                  answer: faq.answer,
                }))}
              />
            </div>
          </section>

        </main>

        <SiteFooter division="disposal" />
      </div>
    </>
  );
}
