"use client";

import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import { motion, useInView } from "motion/react";
import { ArrowRight, PhoneCall, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";

export function DisposalCTASection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 bg-white overflow-hidden border-t border-slate-200/60">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-[#FAFDFB] p-8 sm:p-16 lg:p-20 shadow-2xl shadow-slate-200/60"
        >
          {/* Aceternity Lamp Arc Light Effect */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Top Lamp Arc Beam */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-48 rounded-full bg-gradient-to-b from-[#2E6F40]/25 via-[#2E6F40]/10 to-transparent blur-2xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-1 bg-gradient-to-r from-transparent via-[#2E6F40] to-transparent shadow-[0_0_20px_#2E6F40]" />
          </div>

          {/* Card Content */}
          <div className="relative z-10 mx-auto max-w-3xl text-center space-y-8">
            {/* Glass Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2E6F40]/10 border border-[#2E6F40]/20 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="size-3.5 text-[#2E6F40]" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2E6F40]">
                ZERO-OBLIGATION ENTERPRISE CONSULTATION
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Ready to Retire IT Assets{" "}
              <span className="text-[#2E6F40] block font-extrabold mt-1">
                With Total Compliance Confidence?
              </span>
            </h2>

            {/* Subtitle */}
            <p className="mx-auto max-w-xl text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Schedule a secure pickup or consult with our NIST & ISO certified specialists. We provide transparent pricing, chain-of-custody SLAs, and zero-landfill guarantees.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/disposal/contact"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#2E6F40] hover:bg-[#255833] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#2E6F40]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Request Secure Pickup</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/disposal/contact"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-8 py-4 text-sm font-bold text-slate-800 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="h-4 w-4 text-[#2E6F40]" />
                <span>Talk to ITAD Specialist</span>
              </Link>
            </div>

            {/* Bottom Trust Indicators */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#2E6F40]" />
                <span>Free Estate Assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#2E6F40]" />
                <span>NIST 800-88 Wiping Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#2E6F40]" />
                <span>48h Metropolitan Pickup</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
