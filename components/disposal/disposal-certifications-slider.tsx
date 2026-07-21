"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Award, Fingerprint, Lock, FileCheck2, Scale, Globe2, Leaf } from "lucide-react";

const CERTIFICATIONS = [
  {
    code: "ISO 27001",
    title: "Information Security",
    description: "Certified ISMS data protection protocol for corporate estates.",
    icon: ShieldCheck,
  },
  {
    code: "R2v3 Certified",
    title: "Responsible Recycling",
    description: "Audited downstream electronics recycling & material recovery.",
    icon: Award,
  },
  {
    code: "NIST 800-88",
    title: "Data Sanitization",
    description: "Overwriting, degaussing & physical media destruction standard.",
    icon: Fingerprint,
  },
  {
    code: "HIPAA Compliant",
    title: "Healthcare Custody",
    description: "Protected Health Information (PHI) media decommissioning.",
    icon: Lock,
  },
  {
    code: "GDPR Article 17",
    title: "Right to Erasure",
    description: "Verifiable digital footprint erasure with legal audit trail.",
    icon: Scale,
  },
  {
    code: "SOX Act 404",
    title: "Financial Auditing",
    description: "Internal control verification for retired IT asset inventories.",
    icon: FileCheck2,
  },
  {
    code: "DoD 5220.22-M",
    title: "Defense Sanitization",
    description: "Multi-pass sanitization standard for high-security drives.",
    icon: Globe2,
  },
  {
    code: "Zero-Landfill",
    title: "ESG Accountability",
    description: "100% material recycling certificate for corporate ESG reporting.",
    icon: Leaf,
  },
];

export function DisposalCertificationsSlider() {
  return (
    <div className="relative w-full overflow-hidden bg-[#FAFDFB] py-12 border-y border-slate-200/60">
      {/* Section Header */}
      <div className="mx-auto max-w-7xl px-6 text-center mb-8">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#2E6F40]">
          Regulatory & Environmental Compliance Standards
        </p>
      </div>

      {/* Fade Gradients at Left & Right Edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#FAFDFB] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#FAFDFB] to-transparent" />

      {/* Marquee Track */}
      <div className="flex w-max animate-marquee space-x-6 hover:[animation-play-state:paused]">
        {[...CERTIFICATIONS, ...CERTIFICATIONS].map((cert, index) => {
          const Icon = cert.icon;
          return (
            <div
              key={index}
              className="flex w-[310px] items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm backdrop-blur-md transition-all hover:border-[#2E6F40]/30 hover:shadow-md"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2E6F40]/10 text-[#2E6F40]">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#2E6F40] uppercase tracking-wider">
                    {cert.code}
                  </span>
                </div>
                <h4 className="truncate text-xs font-bold text-slate-900">{cert.title}</h4>
                <p className="truncate text-[11px] text-slate-500 font-medium">{cert.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
