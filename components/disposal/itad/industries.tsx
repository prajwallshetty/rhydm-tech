"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Building2,
  Landmark,
  HeartPulse,
  GraduationCap,
  Factory,
  Cpu,
  Server,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { BlurReveal } from "@/components/ui/accentry/blur-reveal";
import { SpotlightCard } from "@/components/ui/accentry/spotlight-card";

export type IndustryItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

const INDUSTRY_META: Record<
  string,
  {
    icon: React.ElementType;
    badge: string;
    highlights: string[];
  }
> = {
  government: {
    icon: Landmark,
    badge: "Public Sector",
    highlights: ["NIST 800-88 Wiping", "FIPS 140-2 Audit Trails", "Chain-of-Custody"],
  },
  banking: {
    icon: Building2,
    badge: "Financial Services",
    highlights: ["SOX & PCI-DSS Aligned", "Serial-Level Certificates", "On-site Shredding"],
  },
  healthcare: {
    icon: HeartPulse,
    badge: "HIPAA Compliant",
    highlights: ["PHI Media Sanitization", "HIPAA Omnibus Aligned", "Cryptographic Erasure"],
  },
  education: {
    icon: GraduationCap,
    badge: "K-12 & Higher Ed",
    highlights: ["Bulk Campus Refreshes", "Value Recovery Back to Schools", "E-Waste Recycling"],
  },
  manufacturing: {
    icon: Factory,
    badge: "Industrial & OT",
    highlights: ["OT Asset Disposal", "SCADA Drive Wiping", "Zero-Landfill Guarantee"],
  },
  "it-companies": {
    icon: Cpu,
    badge: "Tech & Enterprise",
    highlights: ["Rapid Turnaround", "Global Logistics in 120+ Countries", "API Reporting Integration"],
  },
  "data-centers": {
    icon: Server,
    badge: "Hyperscale & Colocation",
    highlights: ["Server Rack Decommissioning", "High-Density Drive Degaussing", "On-Site Shredding"],
  },
};

const DEFAULT_META = {
  icon: Server,
  badge: "Enterprise Sector",
  highlights: ["Certified Sanitization", "Global Logistics", "Audit-Ready Reports"],
};

export function ItadIndustries({ industries }: { industries: IndustryItem[] }) {
  return (
    <section
      className="relative overflow-hidden bg-white py-24 sm:py-32 border-y border-slate-200/60"
      aria-labelledby="itad-industries-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BlurReveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
              TARGETED COMPLIANCE
            </p>
          </BlurReveal>

          <BlurReveal delay={0.1}>
            <h2
              id="itad-industries-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl"
            >
              Built for the Strict Demands of Regulated Sectors
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Every industry carries unique regulatory risks. We tailor our chain of custody,
              sanitization methods, and compliance documentation to match your exact auditor requirements.
            </p>
          </BlurReveal>
        </div>

        {/* Centered Flex Grid for Industries */}
        <div className="mt-16 flex flex-wrap justify-center gap-6">
          {industries.map((ind, i) => {
            const meta = INDUSTRY_META[ind.slug] || DEFAULT_META;
            const Icon = meta.icon;

            return (
              <motion.div
                key={ind.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-[360px] flex-grow-0 shrink-0"
              >
                <SpotlightCard
                  spotlightColor="rgba(22, 163, 74, 0.12)"
                  borderColor="rgba(22, 163, 74, 0.35)"
                  className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-7 shadow-sm transition-all hover:bg-white hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="grid size-12 place-items-center rounded-xl bg-[#16A34A] text-white shadow-md">
                        <Icon className="size-6" strokeWidth={1.8} />
                      </div>
                      <span className="rounded-full border border-[#16A34A]/20 bg-[#16A34A]/10 px-3 py-1 text-[10px] font-bold text-[#16A34A]">
                        {meta.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold tracking-tight text-[#0F172A]">
                      {ind.name}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {ind.description ||
                        "Tailored IT asset disposition workflows engineered to satisfy strict industry regulations."}
                    </p>

                    <div className="mt-5 space-y-2 border-t border-slate-200/60 pt-4">
                      {meta.highlights.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="size-3.5 text-[#16A34A] shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-2">
                    <Link
                      href="/disposal/contact"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#16A34A] transition-colors group-hover:text-[#15803D]"
                    >
                      <span>Sector Solutions</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
