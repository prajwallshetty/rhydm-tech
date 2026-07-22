"use client";

import { motion } from "motion/react";
import {
  Award,
  BarChart3,
  FileCheck,
  Globe2,
  HardDrive,
  Link2,
  Recycle,
  CheckCircle2,
} from "lucide-react";

import { BlurReveal } from "@/components/ui/accentry/blur-reveal";
import { SpotlightCard } from "@/components/ui/accentry/spotlight-card";

export function ItadShowcase() {
  return (
    <section
      className="relative overflow-hidden bg-white py-24 sm:py-32"
      aria-labelledby="itad-showcase-heading"
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BlurReveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
              ENTERPRISE PLATFORM
            </p>
          </BlurReveal>

          <BlurReveal delay={0.1}>
            <h2
              id="itad-showcase-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl"
            >
              Your Entire IT Estate&rsquo;s Exit, on One Screen
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Lifecycle, custody, compliance and recovered value — visible in real time, exportable for auditors.
            </p>
          </BlurReveal>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Asset lifecycle volume */}
          <SpotlightCard
            spotlightColor="rgba(22, 163, 74, 0.12)"
            borderColor="rgba(22, 163, 74, 0.35)"
            className="sm:col-span-2 bg-slate-50/60"
          >
            <CardHeader icon={BarChart3} title="Asset Lifecycle Volume" />
            <div className="mt-6 flex items-end gap-2.5" aria-hidden>
              {[35, 55, 42, 70, 62, 85, 78, 96].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="flex-1 rounded-t-sm bg-[#16A34A] opacity-90 transition-all hover:opacity-100"
                  style={{ minHeight: "12px", maxHeight: "120px" }}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-600 font-semibold border-t border-slate-200/60 pt-4">
              <span>99.98% Processed On Schedule</span>
              <span className="text-[#16A34A] font-bold">+24% YoY</span>
            </div>
          </SpotlightCard>

          {/* Value Recovered */}
          <SpotlightCard
            spotlightColor="rgba(22, 163, 74, 0.12)"
            borderColor="rgba(22, 163, 74, 0.35)"
            className="bg-slate-50/60"
          >
            <CardHeader icon={Award} title="Value Recovered" />
            <p className="mt-4 text-3xl font-extrabold text-[#0F172A]">$4.8M+</p>
            <p className="mt-1 text-xs font-semibold text-[#16A34A]">Returned to Client Budgets</p>
            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-600 border-t border-slate-200/60 pt-4">
              <CheckCircle2 className="size-3.5 text-[#16A34A]" />
              <span>Full Audit Reconciled</span>
            </div>
          </SpotlightCard>

          {/* Compliance Status */}
          <SpotlightCard
            spotlightColor="rgba(22, 163, 74, 0.12)"
            borderColor="rgba(22, 163, 74, 0.35)"
            className="bg-slate-50/60"
          >
            <CardHeader icon={FileCheck} title="Compliance Status" />
            <div className="mt-4 flex items-center gap-2">
              <span className="grid size-3 place-items-center rounded-full bg-[#16A34A]">
                <span className="size-1.5 rounded-full bg-white" />
              </span>
              <span className="text-sm font-bold text-[#0F172A]">100% Audit-Ready</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Serial-level certificates auto-generated on completion.
            </p>
            <div className="mt-6 border-t border-slate-200/60 pt-4 text-xs font-semibold text-[#16A34A]">
              Download Certificate Log &rarr;
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}

function CardHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-[#16A34A] text-white shadow-sm">
        <Icon className="size-5" strokeWidth={1.8} />
      </span>
      <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
    </div>
  );
}
