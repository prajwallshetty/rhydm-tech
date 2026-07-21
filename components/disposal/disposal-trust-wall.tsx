"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ShieldCheck, Award, Fingerprint, Scale, FileCheck, Globe } from "lucide-react";

const CERTIFICATIONS = [
  { name: "ISO 27001", description: "Information Security Management", icon: ShieldCheck },
  { name: "R2 Certified", description: "Responsible Recycling", icon: Award },
  { name: "NIST 800-88", description: "Data Sanitization Standard", icon: Fingerprint },
  { name: "GDPR", description: "EU Data Protection Regulation", icon: Scale },
  { name: "HIPAA", description: "Healthcare Data Compliance", icon: FileCheck },
  { name: "SOX", description: "Financial Reporting Standards", icon: Globe },
];

const INDUSTRIES = [
  "Healthcare",
  "Education",
  "Government",
  "Banking & Finance",
  "Corporate IT",
  "IT Companies",
  "Manufacturing",
  "Legal & Insurance",
];

function CertCard({ cert, index }: { cert: typeof CERTIFICATIONS[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const IconComponent = cert.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative flex flex-col items-center text-center rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-500 hover:border-[#2E6F40]/30 hover:bg-white/[0.06]"
    >
      {/* Subtle pulse glow behind icon */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 size-12 rounded-full bg-[#2E6F40]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative flex size-14 items-center justify-center rounded-2xl bg-[#2E6F40]/10 border border-[#2E6F40]/20 text-[#2E6F40] transition-transform group-hover:scale-110">
        <IconComponent className="size-6" />
      </div>

      <h3 className="mt-4 text-sm font-bold text-white tracking-tight">{cert.name}</h3>
      <p className="mt-1.5 text-[11px] leading-relaxed text-white/35 font-medium">{cert.description}</p>
    </motion.div>
  );
}

export function DisposalTrustWall() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });
  const industryRef = useRef<HTMLDivElement>(null);
  const industryInView = useInView(industryRef, { once: true, margin: "-40px" });

  return (
    <section className="relative py-28 sm:py-36 bg-[#070e09] overflow-hidden">
      {/* Top border gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-[#2E6F40]/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#2E6F40] mb-4">
            Trust & Compliance
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
            Certified. Audited. Trusted.
          </h2>
          <p className="mt-5 mx-auto max-w-xl text-sm sm:text-base text-white/45 font-medium leading-relaxed">
            We hold the certifications that your auditors look for — every engagement comes with full documentation.
          </p>
        </motion.div>

        {/* Certification grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CERTIFICATIONS.map((cert, i) => (
            <CertCard key={cert.name} cert={cert} index={i} />
          ))}
        </div>

        {/* Industries */}
        <motion.div
          ref={industryRef}
          initial={{ opacity: 0, y: 20 }}
          animate={industryInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#2E6F40] mb-8">
            Trusted Across Regulated Sectors
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {INDUSTRIES.map((industry, i) => (
              <motion.span
                key={industry}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={industryInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-xs font-semibold text-white/55 transition-all hover:border-[#2E6F40]/25 hover:text-white/80"
              >
                {industry}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
