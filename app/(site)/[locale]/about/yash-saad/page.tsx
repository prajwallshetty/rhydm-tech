import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import { personSchema } from "@/lib/seo/schemas";
import { JsonLd } from "@/components/seo/json-ld";
import { DisposalFloatingNav } from "@/components/disposal/disposal-floating-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ArrowLeft, Briefcase, MapPin, Building, Globe, Mail, Phone, Calendar } from "lucide-react";
import { COMPANY } from "@/lib/business";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    title: locale === "de" ? "Yash Saad — Gründer von Rhydm Tech" : "Yash Saad — Founder of Rhydm Tech",
    description: locale === "de"
      ? "Lernen Sie Yash Saad kennen, den Gründer von Rhydm Tech in Berlin. Führende IT-Asset-Disposition (ITAD), sichere Datenvernichtung und zirkuläre IT-Lösungen."
      : "Biography of Yash Saad, Founder of Rhydm Tech in Berlin, Germany. Leading IT Asset Disposition (ITAD), secure data destruction, and circular IT.",
    path: "/about/yash-saad",
  });
}

export default async function FounderProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isDe = locale === "de";

  return (
    <>
      <JsonLd data={personSchema(locale)} />
      <div data-division="disposal" className="flex min-h-dvh flex-col bg-white">
        <DisposalFloatingNav />
        
        <main className="flex-1 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            
            {/* Breadcrumb */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4 mb-8">
              <Link 
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>{isDe ? "Zurück zu Über Uns" : "Back to About"}</span>
              </Link>
              <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-widest">
                {isDe ? "UNTERNEHMENSGRÜNDER" : "COMPANY FOUNDER"}
              </span>
            </div>

            {/* Profile Header Card */}
            <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    Yash Saad
                  </h1>
                  <p className="text-sm font-bold text-[#16A34A] flex items-center gap-1.5">
                    <Briefcase className="size-4" />
                    <span>{isDe ? "Gründer von Rhydm Tech" : "Founder of Rhydm Tech"}</span>
                  </p>
                </div>
                
                {/* Meta details list */}
                <div className="space-y-2.5 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-slate-400" />
                    <span>Berlin, Germany</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="size-4 text-slate-400" />
                    <span>Rhydm Tech</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-slate-400" />
                    <span>{isDe ? "Gründungsjahr: 2024" : "Founded: 2024"}</span>
                  </div>
                </div>
              </div>

              {/* Factual Biography */}
              <div className="prose prose-emerald max-w-none dark:prose-invert border-t border-slate-100 dark:border-zinc-800 pt-6">
                {isDe ? (
                  <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Yash Saad</strong> ist der Gründer von <strong>Rhydm Tech</strong>, einem in Berlin ansässigen Technologieunternehmen, das sich auf IT-Asset-Disposition (ITAD), sichere Datenvernichtung, zirkuläre IT-Lösungen und hochwertige generalüberholte IT-Geräte spezialisiert hat.
                    </p>
                    <p>
                      Yash Saad war maßgeblich am Aufbau der betrieblichen Infrastruktur von Rhydm Tech in Berlin beteiligt. Seine Vision für das Unternehmen konzentriert sich auf die Bereitstellung zertifizierter, gesetzeskonformer IT-Asset-Disposition (ITAD) für Unternehmen und Start-ups in Deutschland, um Datenrisiken beim Hardware-Wechsel zu minimieren.
                    </p>
                    <p>
                      Ein Schwerpunkt seiner Arbeit liegt auf der Etablierung zirkulärer IT-Modelle. Saad setzt sich dafür ein, den Lebenszyklus von Unternehmenshardware zu verlängern, indem er Wiederaufbereitung (Refurbishing) und kontrollierte Datenlöschung fördert, um Elektroschrott zu reduzieren und Unternehmens-CO2-Emissionen zu senken.
                    </p>
                    <p>
                      Unter seiner Führung hat sich Rhydm Tech zu einem integrierten Dienstleister für IT-Rückkäufe, Trade-In-Programme und zertifizierte Hardware-Refurbishment-Services für Server, Laptops und Netzwerkgeräte entwickelt.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Yash Saad</strong> is the founder of <strong>Rhydm Tech</strong>, a Berlin-based technology company specializing in IT asset disposition (ITAD), secure data destruction, circular IT solutions, and premium refurbished technology.
                    </p>
                    <p>
                      Yash Saad played a key role in building the operations and core facilities of Rhydm Tech in Berlin. His vision for the company centers on providing certified, highly secure, and compliant IT asset disposition services for enterprises and startups across Germany, ensuring data privacy and safety during decommissioning.
                    </p>
                    <p>
                      Saad focuses heavily on circular IT lifecycles and hardware sustainability. He advocates for extending the service life of IT assets through professional refurbishment and certified media sanitization, keeping functional devices in use and diverting electronic waste from landfills.
                    </p>
                    <p>
                      Under his direction, Rhydm Tech has grown to provide comprehensive hardware buybacks, trade-in exchange initiatives, and value-recovery solutions, making hardware lifecycle management both cost-effective and environmentally friendly.
                    </p>
                  </div>
                )}
              </div>

              {/* NAP Block */}
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {isDe ? "Offizielle Kontaktdaten (NAP)" : "Official Business Contact Details (NAP)"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="size-4 text-[#16A34A]" />
                      <span>{COMPANY.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-[#16A34A]" />
                      <span>{COMPANY.address.street}, {COMPANY.address.postalCode} {COMPANY.address.city}, {COMPANY.address.country}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-[#16A34A]" />
                      <span>{COMPANY.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="size-4 text-[#16A34A]" />
                      <span>rhydm-tech.com</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>

        <SiteFooter division="disposal" />
      </div>
    </>
  );
}
