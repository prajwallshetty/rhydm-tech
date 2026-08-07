"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Sparkles, ShieldCheck, ArrowRight, Laptop, HelpCircle,
  TrendingUp, RefreshCw, Landmark, CheckCircle2, ChevronDown,
  Sliders, Truck, CreditCard
} from "lucide-react";
import { ExchangeWizard } from "@/components/store/exchange-wizard";
import { submitExchangeRequestAction } from "@/app/actions/exchange";
import { useToast } from "@/components/ui/toast";
import { formatPriceExact } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ExchangeLandingClientProps {
  pageType: "trade-in" | "exchange" | "sell-your-device";
}

export function ExchangeLandingClient({ pageType }: ExchangeLandingClientProps) {
  const router = useRouter();
  const pushToast = useToast((s) => s.push);
  
  const [wizardOpen, setWizardOpen] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroTitles = {
    "trade-in": "Trade In Your Old Tech. Get Premium Upgrades.",
    exchange: "Exchange Old Hardware For Upgraded Performance.",
    "sell-your-device": "Sell Your Old Tech For Instant Store Credit.",
  };

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: heroTitles[pageType],
    description: "Get the best trade-in value for your used laptops, desktops, servers, and monitors. Fast direct checkout, free courier pickup, and eco-friendly refurbishing.",
    publisher: {
      "@type": "Organization",
      name: "Rhydm Tech",
      url: "https://rhydm.tech",
    },
  };

  const faqs = [
    {
      q: "How does the valuation process work?",
      a: "Simply use our online wizard to select your device type, brand, model, and condition. We will calculate an instant estimated valuation. If you accept, pack the device and use our free pickup or prepaid shipping label to send it to us for final inspection.",
    },
    {
      q: "When and how do I receive my credit?",
      a: "For exchanges linked to a purchase, the credit is applied instantly at checkout. For stand-alone device sales, once our technicians inspect your device (usually within 48 hours of receipt), we will issue credit directly to your account.",
    },
    {
      q: "What happens to my personal data on the device?",
      a: "Data security is our top priority. Every device we receive undergoes a military-grade data wipe and sanitization process. We issue a data erasure certificate for every processed computer.",
    },
    {
      q: "What if the technician finds a discrepancy in my description?",
      a: "If the physical inspection reveals differences from your description, we will send you a counter-offer. You can accept the counter-offer, or reject it. If you reject, we ship the device back to you free of charge.",
    },
  ];

  const handleWizardComplete = async (data: any) => {
    setSubmitting(true);
    try {
      const res = await submitExchangeRequestAction(data);
      if (res.success) {
        setSuccessData(res);
        setWizardOpen(false);
        pushToast("Trade-in request submitted successfully!");
      }
    } catch (err: any) {
      console.error(err);
      pushToast("An error occurred during submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#1E3A27] to-slate-950 text-white p-8 md:p-16 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(22,163,74,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-4 w-4" />
            <span>Best Value Trade-In</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {heroTitles[pageType]}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            Turn your laptops, desktops, and servers into instant storefront credits. Free pickup, secure sanitization, and premium warranties guaranteed.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => setWizardOpen(true)}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer text-sm"
            >
              <span>Check Device Value</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="text-xs font-semibold text-slate-500 flex gap-2">
        <Link href="/refurbished" className="hover:text-primary">Home</Link>
        <span>/</span>
        <span className="text-slate-900 capitalize">{pageType.replace("-", " ")}</span>
      </nav>

      {/* How It Works (Steps) */}
      <section className="space-y-12">
        <div className="text-center max-w-lg mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Three Steps. Infinite Performance.</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Getting top-tier value for your old hardware has never been simpler.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Value Online",
              desc: "Describe your device configuration in 9 simple steps. Get an instant automated estimated quote in seconds.",
              icon: Sliders,
            },
            {
              step: "02",
              title: "Ship for Free",
              desc: "Schedule a free courier pickup from your address or drop it off at any local parcel point using our prepaid labels.",
              icon: Truck,
            },
            {
              step: "03",
              title: "Get Store Credit",
              desc: "Once inspected, apply your trade-in credit instantly to refurbished purchases or cash out directly.",
              icon: CreditCard,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-6 relative group shadow-sm space-y-4 hover:border-primary/50 transition-colors">
                <span className="absolute right-6 top-6 text-3xl font-black text-slate-100 font-mono group-hover:text-emerald-500/10 transition-colors">{item.step}</span>
                <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200/40 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-200/40">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">Why Choose Our Trade-In Program?</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            We deliver a premium experience modeled after global recycling leaders. High appraisals, rapid processing, and secure environmental practices.
          </p>
          <div className="space-y-3.5 text-xs font-bold text-slate-800">
            {[
              "Military-grade secure data erasure with certification.",
              "Guaranteed highest payout value and instant pricing engines.",
              "100% free courier collection and insured delivery.",
              "Promoting green circular economy by keeping tech out of landfills.",
            ].map((text, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between aspect-video">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mt-4">Safe & Sanitized</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between aspect-video">
            <TrendingUp className="h-6 w-6 text-blue-650" />
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mt-4">Top Rates</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between aspect-video col-span-2">
            <RefreshCw className="h-6 w-6 text-violet-600" />
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mt-4">Circular Lifecycle</h4>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-black text-slate-900 text-center flex items-center justify-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <span>Frequently Asked Questions</span>
        </h2>
        <div className="divide-y divide-slate-200">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="py-4">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex justify-between items-center text-left py-2 text-sm font-extrabold text-slate-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-500 leading-relaxed font-medium mt-2 pl-1 pr-6 animate-fadeIn">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Wizard trigger Overlay */}
      {wizardOpen && (
        <ExchangeWizard
          onClose={() => setWizardOpen(false)}
          onComplete={handleWizardComplete}
        />
      )}

      {/* Success Dialog Overlay */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-5 border border-slate-100">
            <div className="size-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 text-[#16A34A]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-slate-900">Valuation Request Registered</h3>
              <p className="text-xs text-slate-500 font-medium">Reference: <span className="font-mono font-bold text-slate-900">{successData.referenceNumber}</span></p>
            </div>
            <p className="text-xs text-slate-650 leading-relaxed font-medium">
              We have successfully registered your trade-in estimate of <span className="font-extrabold text-[#16A34A]">{formatPriceExact(successData.estimatedValueCents)}</span>.
              Please go to your account dashboard to print the quotation details and schedule pickup delivery!
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => router.push("/refurbished/account?tab=exchanges")}
                className="w-full py-3 bg-[#16A34A] hover:bg-[#159342] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Go to My Exchanges
              </button>
              <button
                onClick={() => setSuccessData(null)}
                className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
