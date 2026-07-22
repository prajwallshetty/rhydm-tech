"use client";

import { motion } from "motion/react";
import { ShieldCheck, Lock, FileCheck, Award, ArrowUpRight } from "lucide-react";

import { BlurReveal } from "@/components/ui/accentry/blur-reveal";
import { SpotlightCard } from "@/components/ui/accentry/spotlight-card";

export function ItadCompliance() {
  return (
    <section
      className="bg-white py-24 sm:py-32"
      aria-labelledby="itad-compliance-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BlurReveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
              BUILT FOR THE FRAMEWORKS YOU ANSWER TO
            </p>
          </BlurReveal>

          <BlurReveal delay={0.1}>
            <h2
              id="itad-compliance-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl"
            >
              Certified Compliance for Global Auditors
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Certifications govern how we operate. The documentation you receive is what proves it — years after the pickup.
            </p>
          </BlurReveal>
        </div>

        {/* Large Horizontal Compliance Showcase Card (Matching Reference Layout exactly) */}
        <div className="mt-16 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-5xl"
          >
            <SpotlightCard
              spotlightColor="rgba(22, 163, 74, 0.08)"
              borderColor="rgba(22, 163, 74, 0.25)"
              className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white p-0 shadow-lg"
            >
              {/* Card Body: Left & Right Grid */}
              <div className="grid gap-8 p-8 md:grid-cols-12 md:p-12 items-center">
                
                {/* Left Column: Image and Official Pill */}
                <div className="md:col-span-5 flex flex-col items-center md:items-start">
                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-800 mb-6">
                    <ShieldCheck className="size-4 text-[#16A34A]" />
                    <span>OFFICIAL REGISTRATION</span>
                  </div>

                  <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center bg-white p-2">
                    <img
                      src="/isocer.png"
                      alt="ISO 27001 Certified Penetration Test Reporting Compliance Badge"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Right Column: Title and Checklist */}
                <div className="md:col-span-7 flex flex-col items-start">
                  <span className="rounded bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider mb-3">
                    ISO STANDARD
                  </span>

                  <h3 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
                    ISO 27001 Certification
                  </h3>

                  <span className="text-[11px] font-black uppercase text-[#16A34A] tracking-wider mt-1.5 mb-5 block">
                    INFORMATION SECURITY MANAGEMENT
                  </span>

                  <p className="text-sm leading-relaxed text-slate-600 mb-8">
                    Certified information security management systems governing secure data sanitization, physical drive shredding, and global IT asset disposition workflows.
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-5 w-full">
                    {/* Bullet 1 */}
                    <div className="flex gap-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-[#16A34A]">
                        <ShieldCheck className="size-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A]">
                          Internationally Recognized
                        </h4>
                        <p className="text-xs text-slate-500">
                          Aligned with global security standards
                        </p>
                      </div>
                    </div>

                    {/* Bullet 2 */}
                    <div className="flex gap-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-[#16A34A]">
                        <Lock className="size-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A]">
                          Secure by Design
                        </h4>
                        <p className="text-xs text-slate-500">
                          Controls built into every process
                        </p>
                      </div>
                    </div>

                    {/* Bullet 3 */}
                    <div className="flex gap-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-[#16A34A]">
                        <FileCheck className="size-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A]">
                          Audited & Verified
                        </h4>
                        <p className="text-xs text-slate-500">
                          Independent audits and continuous compliance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-5 md:px-12">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <ShieldCheck className="size-4 text-[#16A34A]" />
                  <span>AUDITED & REGISTERED VERIFICATION</span>
                </div>

                <a
                  href="/isocer.png"
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center gap-1 py-2 -my-2 text-xs font-bold text-[#16A34A] hover:underline"
                >
                  <span>VIEW CERTIFICATE</span>
                  <ArrowUpRight className="size-4.5" />
                </a>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
