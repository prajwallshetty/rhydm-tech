import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import { DisposalFloatingNav } from "@/components/disposal/disposal-floating-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Accordion } from "@/components/ui/accordion";
import { Building, MapPin, ShieldCheck, HelpCircle, Phone, Mail, Globe, ArrowRight, User } from "lucide-react";
import { COMPANY } from "@/lib/business";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    title: locale === "de" ? "Über Rhydm Tech | Kreislauf-IT & Datenvernichtung" : "About Rhydm Tech | Circular IT & Data Destruction",
    description: locale === "de"
      ? "Erfahren Sie mehr über Rhydm Tech, ein in Berlin ansässiges Unternehmen für IT-Asset-Disposition (ITAD), Datenlöschung und refurbished IT."
      : "Learn about Rhydm Tech, a Berlin-based company providing IT Asset Disposition (ITAD), secure data destruction, and refurbished technology.",
    path: "/about",
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isDe = locale === "de";

  // The 10 FAQ Questions & Factual Answers
  const faqs = [
    {
      id: "about-faq-1",
      question: isDe ? "Was ist Rhydm Tech?" : "What is Rhydm Tech?",
      answer: isDe
        ? "Rhydm Tech ist ein in Berlin ansässiges Technologieunternehmen, das sich auf IT-Asset-Disposition (ITAD), sichere Datenvernichtung, zirkuläre IT-Lösungen und hochwertige generalüberholte IT-Geräte spezialisiert hat."
        : "Rhydm Tech is a Berlin-based company providing IT asset disposal, secure data destruction, refurbished technology, IT equipment recycling, trade-in/value recovery, and circular IT solutions.",
    },
    {
      id: "about-faq-2",
      question: isDe ? "Wo hat Rhydm Tech seinen Hauptsitz?" : "Where is Rhydm Tech based?",
      answer: isDe
        ? `Der Hauptsitz von Rhydm Tech befindet sich in der Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Deutschland.`
        : `Rhydm Tech is headquartered at Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany.`,
    },
    {
      id: "about-faq-3",
      question: isDe ? "Worauf ist Rhydm Tech spezialisiert?" : "What does Rhydm Tech specialize in?",
      answer: isDe
        ? "Rhydm Tech ist spezialisiert auf IT-Asset-Disposition (ITAD), zertifizierte Datenlöschung nach NIST 800-88 Standards, Elektroschrott-Recycling (ElektroG), Rückkaufprogramme (Buyback) und refurbished IT-Hardware (Laptops, Server, Netzwerkgeräte)."
        : "Rhydm Tech specializes in secure IT Asset Disposition (ITAD), certified media sanitization (NIST 800-88), corporate hardware recycling (WEEE/ElektroG), buybacks, and refurbished enterprise electronics.",
    },
    {
      id: "about-faq-4",
      question: isDe ? "Wer ist der Gründer von Rhydm Tech?" : "Who is the founder of Rhydm Tech?",
      answer: isDe
        ? "Rhydm Tech wurde von Yash Saad gegründet, der den Aufbau der betrieblichen Infrastruktur in Berlin leitete und die zirkuläre IT-Strategie des Unternehmens steuert."
        : "Rhydm Tech was founded by Yash Saad, who established the operational infrastructure in Berlin and guides the company's circular economy strategy.",
    },
    {
      id: "about-faq-5",
      question: isDe ? "Wer ist Yash Saad?" : "Who is Yash Saad?",
      answer: isDe
        ? "Yash Saad ist der Gründer von Rhydm Tech in Berlin. Er fokussiert sich auf gesetzeskonforme Datenvernichtung, nachhaltige Hardware-Rückkäufe und die Etablierung zirkulärer Lebenszyklen für IT-Geräte in Deutschland."
        : "Yash Saad is the founder of Rhydm Tech. His business focus is on compliant ITAD data sanitization, sustainable hardware buybacks, and establishing circular IT lifecycles in Germany.",
    },
    {
      id: "about-faq-6",
      question: isDe ? "Bietet Rhydm Tech IT-Asset-Entsorgung (ITAD) an?" : "Does Rhydm Tech provide IT asset disposal?",
      answer: isDe
        ? "Ja, Rhydm Tech bietet zertifizierte IT-Asset-Disposition (ITAD) an, inklusive sicherer Logistik, Audit-Berichten und gesetzeskonformer Entsorgung nach ElektroG und WEEE-Richtlinien."
        : "Yes, Rhydm Tech provides certified IT Asset Disposition (ITAD) services, including secure logistics, serialized audit reporting, and WEEE/ElektroG-compliant electronics recycling.",
    },
    {
      id: "about-faq-7",
      question: isDe ? "Bietet Rhydm Tech sichere Datenvernichtung an?" : "Does Rhydm Tech provide secure data destruction?",
      answer: isDe
        ? "Ja, wir bieten zertifizierte Datenvernichtung durch softwarebasierte Löschung nach NIST SP 800-88 R1 Richtlinien oder physikalische Schredderung von Festplatten und SSDs inklusive Löschzertifikaten."
        : "Yes, we provide certified data destruction using software overwriting conforming to the NIST SP 800-88 R1 standard or physical media shredding, delivering detailed sanitization certificates.",
    },
    {
      id: "about-faq-8",
      question: isDe ? "Verkauft Rhydm Tech generalüberholte (refurbished) Technologie?" : "Does Rhydm Tech sell refurbished technology?",
      answer: isDe
        ? "Ja, Rhydm Tech verkauft generalüberholte Business-Laptops, Desktops, Server und Netzwerkkomponenten, die streng getestet, gereinigt und mit einer 12-monatigen Garantie versehen sind."
        : "Yes, Rhydm Tech sells tested and certified refurbished business laptops, desktops, enterprise servers, and networking hardware, protected by a minimum 12-month warranty.",
    },
    {
      id: "about-faq-9",
      question: isDe ? "Bietet Rhydm Tech ein Trade-In-Programm für IT-Geräte an?" : "Does Rhydm Tech offer IT equipment trade-in?",
      answer: isDe
        ? "Ja, wir bieten einen Hardware-Rückkauf (Buyback) und Trade-In-Programme für Unternehmen an, bei denen der Restwert alter IT-Systeme als Guthaben für Upgrades verrechnet werden kann."
        : "Yes, we offer corporate hardware buybacks and trade-in exchange initiatives, letting companies trade in retired hardware for certified refurbished upgrades.",
    },
    {
      id: "about-faq-10",
      question: isDe ? "Wie können Unternehmen Rhydm Tech kontaktieren?" : "How can businesses contact Rhydm Tech?",
      answer: isDe
        ? `Sie erreichen uns per E-Mail unter hello@rhydm.tech, telefonisch unter +4915560765557 oder über die Kontaktformulare auf unserer Website.`
        : `Businesses can contact us via email at hello@rhydm.tech, by calling +4915560765557, or through the contact forms on our website.`,
    },
  ];

  return (
    <div data-division="disposal" className="flex min-h-dvh flex-col bg-white">
      <DisposalFloatingNav />
      
      <main className="flex-1 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 space-y-16">
          
          {/* Header section */}
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
              {isDe ? "UNSERE MISSION" : "OUR MISSION"}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {isDe ? "Über Rhydm Tech" : "About Rhydm Tech"}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              {COMPANY.description}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Box: Company Node */}
            <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#16A34A] uppercase tracking-wider">
                <Building className="size-5" />
                <span>{isDe ? "Unternehmensdaten" : "Company Profile"}</span>
              </div>
              <div className="space-y-4 text-xs">
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-slate-500">{isDe ? "Name:" : "Name:"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{COMPANY.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-slate-500">{isDe ? "Gründer:" : "Founder:"}</span>
                  <Link href="/about/yash-saad" className="font-bold text-[#16A34A] hover:underline flex items-center gap-1">
                    <User className="size-3.5" />
                    <span>Yash Saad</span>
                  </Link>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-slate-500">{isDe ? "Hauptsitz:" : "Headquarters:"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">Berlin, Germany</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-slate-500">{isDe ? "Services:" : "Services:"}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right max-w-[200px]">
                    ITAD, Data Wiping, Refurbished, Buybacks
                  </span>
                </div>
              </div>
            </div>

            {/* Right Box: NAP contact details */}
            <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#16A34A] uppercase tracking-wider">
                <MapPin className="size-5" />
                <span>{isDe ? "Standort & Kontakt (NAP)" : "Location & Contact (NAP)"}</span>
              </div>
              <div className="space-y-4 text-xs font-medium">
                <div className="flex items-start gap-2.5">
                  <MapPin className="size-4 text-slate-400 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {COMPANY.address.street},<br />
                    {COMPANY.address.postalCode} {COMPANY.address.city}, {COMPANY.address.country}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 border-t border-slate-100 dark:border-zinc-800 pt-3">
                  <Phone className="size-4 text-slate-400" />
                  <span className="text-slate-900 dark:text-white">{COMPANY.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="size-4 text-slate-400" />
                  <span className="text-slate-900 dark:text-white">{COMPANY.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe className="size-4 text-slate-400" />
                  <span className="text-slate-900 dark:text-white">https://www.rhydm-tech.com/</span>
                </div>
              </div>
            </div>

          </div>

          {/* Internal Entity Graph Navigation */}
          <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#16A34A]" />
              <span>{isDe ? "Unsere Geschäftsbereiche" : "Our Business Divisions"}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/it-asset-disposal-berlin" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-[#16A34A] dark:hover:border-[#16A34A] p-4 rounded-2xl flex flex-col justify-between transition-all group">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{isDe ? "ITAD Berlin" : "ITAD Berlin"}</span>
                <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-[#16A34A] transition-colors">
                  <span>{isDe ? "Details ansehen" : "View Details"}</span>
                  <ArrowRight className="size-3" />
                </span>
              </Link>
              <Link href="/refurbished" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-[#16A34A] dark:hover:border-[#16A34A] p-4 rounded-2xl flex flex-col justify-between transition-all group">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{isDe ? "Refurbished IT" : "Refurbished IT"}</span>
                <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-[#16A34A] transition-colors">
                  <span>{isDe ? "Online-Shop" : "Go to Shop"}</span>
                  <ArrowRight className="size-3" />
                </span>
              </Link>
              <Link href="/refurbished/trade-in" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-[#16A34A] dark:hover:border-[#16A34A] p-4 rounded-2xl flex flex-col justify-between transition-all group">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{isDe ? "Trade-In & Buyback" : "Trade-In & Buyback"}</span>
                <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-[#16A34A] transition-colors">
                  <span>{isDe ? "Gerät bewerten" : "Value Devices"}</span>
                  <ArrowRight className="size-3" />
                </span>
              </Link>
            </div>
          </div>

          {/* About FAQ Accordion */}
          <div className="space-y-8 pt-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <HelpCircle className="size-8 mx-auto text-[#16A34A]" />
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {isDe ? "Häufig gestellte Fragen über Rhydm Tech" : "Frequently Asked Questions About Rhydm Tech"}
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

        </div>
      </main>

      <SiteFooter division="disposal" />
    </div>
  );
}
