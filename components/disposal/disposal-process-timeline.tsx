"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useSpring } from "motion/react";
import {
  ClipboardCheck,
  Truck,
  Barcode,
  HardDriveDownload,
  Flame,
  Recycle,
  Award,
  CheckCircle2,
} from "lucide-react";

const PROCESS_STEPS = [
  {
    step: 1,
    title: "1. Scope & Compliance Scoping",
    subtitle: "Risk & Retention Mapping",
    description:
      "We conduct a preliminary security review to catalog asset quantities, media types, retention obligations, and regulatory frameworks (HIPAA, SOX, GDPR, NIST 800-88).",
    icon: ClipboardCheck,
    deliverable: "Custom Decommissioning Plan & NDA",
  },
  {
    step: 2,
    title: "2. Secure GPS-Tracked Pickup",
    subtitle: "Insured Chain-of-Custody",
    description:
      "Our background-checked logistics team arrives in GPS-monitored, lockable vehicles. Hardware is loaded into tamper-evident sealed bins with dual signatures.",
    icon: Truck,
    deliverable: "Signed Transfer Manifest & Vehicle Lock Code",
  },
  {
    step: 3,
    title: "3. Barcode Inventory Reconciliation",
    subtitle: "Serial Number Logging",
    description:
      "Upon intake at our secure facility, every chassis, drive, and module is barcode-scanned and reconciled against your initial asset register to eliminate discrepancies.",
    icon: Barcode,
    deliverable: "Reconciled Audit Asset Register (CSV/PDF)",
  },
  {
    step: 4,
    title: "4. NIST 800-88 Data Sanitization",
    subtitle: "Cryptographic & Overwrite Erasure",
    description:
      "Storage media undergoes multi-pass software overwriting or cryptographic erasure in accordance with NIST Special Publication 800-88 Rev 1. Failed drives are quarantined.",
    icon: HardDriveDownload,
    deliverable: "Per-Drive Verification Wiping Log",
  },
  {
    step: 5,
    title: "5. Physical Destruction (On-Site/Off-Site)",
    subtitle: "High-Torque Shredding & Degaussing",
    description:
      "Quarantined or ultra-sensitive media is shredded into 12mm particles using high-torque mechanical shredders under continuous 4K CCTV recording.",
    icon: Flame,
    deliverable: "HD CCTV Video Recording & Shred Weight Report",
  },
  {
    step: 6,
    title: "6. Zero-Landfill Material Recovery",
    subtitle: "R2v3 E-Waste Processing",
    description:
      "Commodity materials (gold, copper, aluminum, rare earths) are extracted via audited R2v3 downstream partners with 100% landfill diversion.",
    icon: Recycle,
    deliverable: "ESG Environmental Impact Certificate",
  },
  {
    step: 7,
    title: "7. Official Audit Certificate Issuance",
    subtitle: "Legal Protection Guarantee",
    description:
      "You receive legal Certificates of Data Destruction signed by certified security personnel, ready for internal risk committees and external compliance auditors.",
    icon: Award,
    deliverable: "Tamper-Proof Certificate of Destruction PDF",
  },
];

export function DisposalProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

  // Aceternity Tracing Beam scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 60%", "end 80%"],
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 bg-white overflow-hidden border-t border-slate-200/60">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute right-0 top-1/4 size-[34rem] rounded-full bg-[#2E6F40]/8 blur-3xl" />

      <div className="mx-auto max-w-5xl px-6">
        {/* Section Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2E6F40]/10 border border-[#2E6F40]/20 px-3.5 py-1.5">
            <span className="size-2 rounded-full bg-[#2E6F40] animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2E6F40]">
              7-STEP CHAIN OF CUSTODY
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            How We Guarantee Zero-Risk Decommissioning
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            From initial site pickup to final audit certificate, every step generates verifiable digital evidence.
          </p>
        </motion.div>

        {/* Timeline Container with Tracing Beam */}
        <div className="relative pl-6 sm:pl-10 space-y-12">
          {/* Static Background Beam Line */}
          <div className="absolute left-[15px] sm:left-[23px] top-4 bottom-4 w-1 rounded-full bg-slate-200" />

          {/* Animated Aceternity Glowing Tracing Beam */}
          <motion.div
            style={{ scaleY, transformOrigin: "top" }}
            className="absolute left-[15px] sm:left-[23px] top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-[#2E6F40] via-emerald-400 to-[#2E6F40] shadow-[0_0_12px_rgba(46,111,64,0.6)]"
          />

          {/* Step Items */}
          {PROCESS_STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="relative group flex flex-col sm:flex-row gap-6 items-start rounded-3xl border border-slate-200/80 bg-[#FAFDFB] p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-[#2E6F40]/40 hover:bg-white hover:shadow-lg hover:shadow-slate-200/60"
              >
                {/* Timeline Icon Node */}
                <div className="absolute -left-[37px] sm:-left-[47px] top-7 flex size-8 sm:size-10 items-center justify-center rounded-full bg-white border-2 border-[#2E6F40] text-[#2E6F40] shadow-md shadow-[#2E6F40]/20 transition-transform group-hover:scale-110">
                  <Icon className="size-4 sm:size-5" />
                </div>

                {/* Content Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-wider text-[#2E6F40]">
                      {item.subtitle}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">{item.description}</p>

                  {/* Deliverable Box */}
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-white border border-slate-200/80 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs">
                    <CheckCircle2 className="size-4 text-[#2E6F40] shrink-0" />
                    <span>Audit Deliverable: {item.deliverable}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
