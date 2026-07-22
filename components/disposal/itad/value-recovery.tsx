"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Banknote, Laptop2, RefreshCcw } from "lucide-react";

import { Counter } from "@/components/disposal/itad/counter";
import { BlurReveal } from "@/components/ui/accentry/blur-reveal";

export function ItadValueRecovery() {
  return (
    <section
      className="overflow-hidden bg-slate-50/70 py-28 sm:py-36 border-y border-slate-200/60"
      aria-labelledby="itad-value-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Huge Minimal Typography Statistics */}
          <div className="lg:col-span-7">
            <BlurReveal>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
                MINIMAL TYPOGRAPHY STATS
              </p>
            </BlurReveal>

            <BlurReveal delay={0.1}>
              <h2
                id="itad-value-heading"
                className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl"
              >
                Recover More Than Just Hardware
              </h2>
            </BlurReveal>

            <BlurReveal delay={0.2}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Devices passing sanitization and testing are refurbished and resold through our global channels — and a transparent share of every sale flows back to your IT budget.
              </p>
            </BlurReveal>

            {/* Apple/Stripe Minimal Typography Stats (No Card Boxes, Bold Impact) */}
            <BlurReveal delay={0.3}>
              <div className="mt-10 flex flex-col sm:flex-row sm:items-baseline gap-6 border-t border-slate-200 pt-8">
                <div>
                  <span className="text-6xl font-black tracking-tight text-[#0F172A] sm:text-7xl lg:text-8xl leading-none">
                    <Counter value={45} suffix="%" duration={1.8} />
                  </span>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                    Average Asset Value Recovered Back
                  </p>
                </div>

                <div className="border-l border-slate-200 pl-6 hidden sm:block">
                  <p className="text-3xl font-black text-[#0F172A]">$4.8M+</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Returned to Enterprise Budgets
                  </p>
                </div>
              </div>
            </BlurReveal>

            <BlurReveal delay={0.4}>
              <div className="mt-10">
                <Link
                  href="/refurbished"
                  className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#16A34A] hover:underline"
                >
                  <span>See where devices get a second life</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </BlurReveal>
          </div>

          {/* Right Column: Refurbish vs Recycle Breakdown */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border-l-4 border-l-[#16A34A] bg-white p-8 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-xl bg-emerald-50 text-[#16A34A]">
                    <Laptop2 className="size-6" strokeWidth={1.8} />
                  </div>
                  <span className="text-base font-bold text-[#0F172A]">Hardware Lifecycle Split</span>
                </div>
                <RefreshCcw className="size-5 text-[#16A34A]" />
              </div>

              <div className="mt-8 space-y-4">
                {[
                  { label: "Refurbished & Resold", pct: "68%", color: "bg-[#16A34A]" },
                  { label: "Recycled Zero-Landfill", pct: "27%", color: "bg-slate-700" },
                  { label: "Redeployed Internally", pct: "5%", color: "bg-slate-400" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{row.label}</span>
                      <span>{row.pct}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${row.color}`} style={{ width: row.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
