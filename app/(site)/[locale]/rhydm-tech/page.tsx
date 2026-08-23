import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  organizationSchema,
  websiteSchema,
  graphSchema,
  breadcrumbSchema,
} from "@/lib/seo/schemas";
import { JsonLd } from "@/components/seo/json-ld";
import { DisposalFloatingNav } from "@/components/disposal/disposal-floating-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { COMPANY } from "@/lib/business";
import {
  Building2,
  MapPin,
  ShieldCheck,
  Globe2,
  Phone,
  Mail,
  ArrowRight,
  Cpu,
  RefreshCw,
  HardDrive,
} from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isDe = locale === "de";

  return createPageMetadata({
    title: "Rhydm Tech — Rhydm Technologies",
    absoluteTitle: true,
    description: isDe
      ? "Rhydm Tech ist die Technologie-Marke von Rhydm Technologies in Berlin. Erfahren Sie alles über unsere Dienstleistungen für ITAD, Datenlöschung und Refurbished IT."
      : "Rhydm Tech is the technology brand of Rhydm Technologies, a Berlin-based company providing IT asset disposal, secure data destruction, refurbished technology, and circular IT solutions across Germany.",
    path: "/rhydm-tech",
    keywords: [
      "Rhydm Tech",
      "Rhydm Technologies",
      "Rhydm Tech Berlin",
      "Rhydm Technologies Berlin",
      "Rhydm Tech Germany",
      "Rhydm ITAD",
      "Rhydm refurbished",
    ],
  });
}

export default async function BrandEntityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isDe = locale === "de";

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Rhydm Tech", url: "/rhydm-tech" },
  ]);

  return (
    <>
      <JsonLd data={graphSchema(organizationSchema(), websiteSchema(), breadcrumbs)} />
      <div data-division="disposal" className="flex min-h-dvh flex-col bg-white">
        <DisposalFloatingNav />

        <main className="flex-1 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 py-12 sm:py-20">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 space-y-16">
            
            {/* Header Hero */}
            <div className="space-y-6 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#16A34A] text-xs font-bold uppercase tracking-wider">
                <Building2 className="size-4" />
                <span>{isDe ? "Offizielle Marken- & Unternehmensübersicht" : "Official Brand & Company Hub"}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Rhydm Tech
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {isDe
                  ? "Rhydm Tech ist die Technologie-Marke von Rhydm Technologies, einem in Berlin ansässigen Unternehmen für IT-Asset-Disposition (ITAD), zertifizierte Datenvernichtung, generalüberholte Technologie und zirkuläre IT-Lösungen in Deutschland."
                  : "Rhydm Tech is the technology brand of Rhydm Technologies, providing IT asset disposal, secure data destruction, refurbished technology and circular IT solutions."}
              </p>
            </div>

            {/* Quick Fact Sheet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-3 text-[#16A34A] font-bold text-sm uppercase tracking-wider">
                  <ShieldCheck className="size-5" />
                  <span>{isDe ? "Markenarchitektur" : "Brand Architecture"}</span>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                    <span className="font-semibold text-slate-500">{isDe ? "Markenname:" : "Customer Brand:"}</span>
                    <span className="font-bold text-slate-900 dark:text-white">Rhydm Tech</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                    <span className="font-semibold text-slate-500">{isDe ? "Rechtsträger:" : "Legal Entity:"}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{COMPANY.legalName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                    <span className="font-semibold text-slate-500">{isDe ? "Beziehung:" : "Relationship:"}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Rhydm Tech = brand of Rhydm Technologies</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                    <span className="font-semibold text-slate-500">{isDe ? "Gründer:" : "Founder:"}</span>
                    <Link href="/about/yash-saad" className="font-bold text-[#16A34A] hover:underline">Yash Saad</Link>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-3 text-[#16A34A] font-bold text-sm uppercase tracking-wider">
                  <MapPin className="size-5" />
                  <span>{isDe ? "Standort & Kontakt" : "Location & Contact"}</span>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{COMPANY.address.street}, {COMPANY.address.postalCode} {COMPANY.address.city}, {COMPANY.address.country}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="size-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">{COMPANY.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="size-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">{COMPANY.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="size-4 text-slate-400 shrink-0" />
                    <Link href="/" className="font-bold text-[#16A34A] hover:underline">https://rhydm-tech.com/</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Questions Section */}
            <div className="space-y-12">
              
              {/* Question 1: What is Rhydm Tech? */}
              <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isDe ? "Was ist Rhydm Tech?" : "What is Rhydm Tech?"}
                </h2>
                <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-3">
                  <p>
                    {isDe
                      ? "Rhydm Tech ist die führende Kundenmarke für nachhaltige Unternehmens-IT und Datenvernichtungslösungen. Als spezialisierte Technologiemarke verbindet Rhydm Tech die sichere Außerdienststellung von IT-Systemen mit der Aufarbeitung und Wiedervermarktung hochwertiger Hardware."
                      : "Rhydm Tech is the customer-facing technology brand dedicated to sustainable enterprise hardware disposition and data security. Under the Rhydm Tech brand, businesses and consumers access certified IT Asset Disposition (ITAD), secure media sanitization, and high-performance refurbished electronics."}
                  </p>
                  <p>
                    {isDe
                      ? "Durch die Kombination aus moderner Datenlöschung und zirkulären Lieferketten ermöglicht Rhydm Tech Unternehmen in ganz Deutschland, Datenrisiken zu minimieren und ESG-Nachhaltigkeitsziele zu erreichen."
                      : "By unifying NIST 800-88 data erasure with circular supply chains, Rhydm Tech enables organizations across Germany and Europe to eliminate data breach liabilities while achieving ambitious ESG carbon reduction targets."}
                  </p>
                </div>
              </section>

              {/* Question 2: What is Rhydm Technologies? */}
              <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isDe ? "Was ist Rhydm Technologies?" : "What is Rhydm Technologies?"}
                </h2>
                <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-3">
                  <p>
                    {isDe
                      ? `Rhydm Technologies (${COMPANY.legalName}) ist das rechtliche Mutterunternehmen hinter der Marke Rhydm Tech. Das Unternehmen ist in Berlin, Deutschland, ansässig und betreibt zertifizierte Logistik-, Audit- und Refurbishing-Prozesse.`
                      : `Rhydm Technologies (${COMPANY.legalName}) is the official legal entity operating the Rhydm Tech brand. Headquartered in Berlin, Germany, Rhydm Technologies oversees all compliance, secure facility management, legal data protection contracts (AVV), and commercial operations.`}
                  </p>
                  <p>
                    {isDe
                      ? "Das Unternehmen wurde 2024 von Yash Saad gegründet mit der Vision, veraltete Entsorgungspraktiken durch auditierbare, zirkuläre IT-Lebenszyklen zu ersetzen."
                      : "Founded in 2024 by Yash Saad, Rhydm Technologies operates from its Spandau facilities in Berlin, managing end-to-end ITAD workflows and corporate hardware buybacks for startups, Mittelstand companies, and enterprises."}
                  </p>
                </div>
              </section>

              {/* Question 3: What does Rhydm Tech do? */}
              <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isDe ? "Was macht Rhydm Tech?" : "What does Rhydm Tech do?"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                      <HardDrive className="size-4 text-[#16A34A]" />
                      <span>{isDe ? "Zertifizierte IT-Asset-Entsorgung (ITAD)" : "Certified IT Asset Disposal (ITAD)"}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isDe
                        ? "Abholung, Inventarisierung und auditierbare Stilllegung von Laptops, Servern und Netzwerkgeräten."
                        : "Secure collection, serial-level inventorying, and auditable decommissioning of enterprise IT assets."}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                      <ShieldCheck className="size-4 text-[#16A34A]" />
                      <span>{isDe ? "Sichere Datenvernichtung" : "Secure Data Destruction"}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isDe
                        ? "Zertifizierte Datenlöschung nach NIST SP 800-88 R1 und physische Schredderung inklusive Löschzertifikaten."
                        : "NIST 800-88 software wiping and physical media shredding backed by individual certificates of destruction."}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                      <Cpu className="size-4 text-[#16A34A]" />
                      <span>{isDe ? "Generalüberholte Hardware (Refurbished)" : "Certified Refurbished Hardware"}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isDe
                        ? "Professionell getestete Business-Laptops, Desktops und Server mit 12 bis 24 Monaten Garantie."
                        : "Rigorously tested business laptops, workstations, and servers with 12 to 24-month warranties."}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                      <RefreshCw className="size-4 text-[#16A34A]" />
                      <span>{isDe ? "Hardware-Rückkauf & Trade-In" : "Corporate Trade-In & Buybacks"}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isDe
                        ? "Bewertung und Anrechnung des Restwerts alter Hardware für kostengünstige IT-Upgrades."
                        : "Maximizing residual value recovery on decommissioned gear to credit toward replacement hardware."}
                    </p>
                  </div>
                </div>
              </section>

              {/* Question 4: Where is Rhydm Tech? */}
              <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isDe ? "Wo befindet sich Rhydm Tech?" : "Where is Rhydm Tech located?"}
                </h2>
                <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-3">
                  <p>
                    {isDe
                      ? `Rhydm Tech und das Mutterunternehmen Rhydm Technologies haben ihren Sitz in **Berlin, Deutschland**.`
                      : `Rhydm Tech and its parent entity Rhydm Technologies are headquartered in **Berlin, Germany**.`}
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-800 dark:text-slate-200">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">Rhydm Technologies UG (haftungsbeschränkt)</p>
                    <p>{COMPANY.address.street}</p>
                    <p>{COMPANY.address.postalCode} {COMPANY.address.city}, {COMPANY.address.country}</p>
                    <p className="mt-2 text-slate-500">Phone: {COMPANY.phone} | Email: {COMPANY.email}</p>
                  </div>
                </div>
              </section>

              {/* Question 5: What services does Rhydm Tech provide? */}
              <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isDe ? "Welche Dienstleistungen bietet Rhydm Tech an?" : "What services does Rhydm Tech provide?"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link href="/disposal/services" className="group p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-[#16A34A] transition-all bg-white dark:bg-zinc-900 flex flex-col justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#16A34A] transition-colors">
                      {isDe ? "ITAD Services" : "ITAD Services"}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <span>{isDe ? "Übersicht ansehen" : "Explore Services"}</span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform text-[#16A34A]" />
                    </span>
                  </Link>

                  <Link href="/refurbished" className="group p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-[#16A34A] transition-all bg-white dark:bg-zinc-900 flex flex-col justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#16A34A] transition-colors">
                      {isDe ? "Refurbished Store" : "Refurbished Store"}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <span>{isDe ? "Shop besuchen" : "Visit Store"}</span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform text-[#16A34A]" />
                    </span>
                  </Link>

                  <Link href="/about" className="group p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-[#16A34A] transition-all bg-white dark:bg-zinc-900 flex flex-col justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#16A34A] transition-colors">
                      {isDe ? "Über Uns" : "About Company"}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <span>{isDe ? "Profil lesen" : "Read Profile"}</span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform text-[#16A34A]" />
                    </span>
                  </Link>
                </div>
              </section>

            </div>

          </div>
        </main>

        <SiteFooter division="disposal" />
      </div>
    </>
  );
}
