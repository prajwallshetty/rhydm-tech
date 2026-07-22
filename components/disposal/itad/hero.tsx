"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Globe2,
  HardDrive,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useRef } from "react";

import { Counter } from "@/components/disposal/itad/counter";

const STATS = [
  { value: 120_000, suffix: "+", label: "Devices Managed" },
  { value: 120, suffix: "+", label: "Countries" },
  { value: 45, suffix: "%", label: "Avg. Asset Value Recovered" },
  { value: 80_000, suffix: "+", label: "Hours Saved" },
];

export function ItadHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // Parallax: mockup drifts slower than the scroll, blobs slower still.
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white"
      aria-labelledby="itad-hero-heading"
    >
      {/* Animated mesh gradient + floating blobs */}
      <motion.div
        aria-hidden
        style={reduceMotion ? undefined : { y: blobY }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="animate-drift-slow absolute -left-48 -top-40 size-[40rem] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="animate-drift-slower absolute -right-40 top-24 size-[36rem] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="animate-drift-slow absolute bottom-0 left-1/3 size-[30rem] rounded-full bg-blue-400/8 blur-3xl" />
        {/* Subtle dot grid, faded at edges */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, #E5E7EB 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 75% 60% at 50% 35%, black 25%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 60% at 50% 35%, black 25%, transparent 75%)",
          }}
        />
      </motion.div>

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-16 pt-20 sm:pt-28 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* Left — copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-gray-800 shadow-sm backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Enterprise ITAD Platform
            </p>

            <h1
              id="itad-hero-heading"
              className="mt-7 text-5xl font-extrabold leading-[1.04] tracking-tight text-gray-900 text-balance sm:text-6xl xl:text-7xl"
            >
              Global IT Asset Disposition{" "}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                (ITAD)
              </span>
              , Simplified.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-600 text-pretty">
              Securely retire, wipe, refurbish, recycle, redeploy, and recover
              value from IT assets across 120+ countries with one centralized
              ITAD platform.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/disposal/contact"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gray-900 px-8 text-base font-semibold text-white shadow-lg shadow-gray-900/10 transition-all hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:shadow-blue-600/25"
              >
                Book a 30-Min Demo
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="#itad-process"
                className="inline-flex h-14 items-center justify-center rounded-full border border-gray-200 bg-white/80 px-8 text-base font-semibold text-gray-900 backdrop-blur transition-colors hover:border-gray-300 hover:bg-slate-50"
              >
                See How It Works
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck aria-hidden className="size-4 text-emerald-500" />
                NIST 800-88 wiping
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileCheck aria-hidden className="size-4 text-emerald-500" />
                Serial-level certificates
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 aria-hidden className="size-4 text-emerald-500" />
                120+ countries
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right — dashboard mockup */}
        <motion.div
          style={reduceMotion ? undefined : { y: mockupY }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <DashboardMockup />
        </motion.div>
      </div>

      {/* Stats band */}
      <div className="relative border-t border-gray-200 bg-white/70 backdrop-blur">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-6 py-12 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center lg:text-left"
            >
              <dd className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </dd>
              <dt className="mt-2 text-sm font-medium text-gray-500">
                {stat.label}
              </dt>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */

/**
 * Stylised product mockup, built in markup rather than an image so it stays
 * crisp at every viewport, weighs nothing, and inherits the design tokens.
 */
function DashboardMockup() {
  return (
    <div className="relative">
      {/* Glow behind the card */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-blue-600/15 via-transparent to-emerald-500/15 blur-2xl"
      />

      <div className="relative rounded-[28px] border border-gray-200 bg-white/85 p-5 shadow-[0_24px_80px_-24px_rgba(17,24,39,0.25)] backdrop-blur-xl">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-gray-200" />
            <span className="size-2.5 rounded-full bg-gray-200" />
            <span className="size-2.5 rounded-full bg-gray-200" />
          </div>
          <p className="text-xs font-semibold tracking-wide text-gray-700">
            ITAD Command Center
          </p>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Live
          </span>
        </div>

        {/* KPI row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <MockKpi label="Devices Retired" value="12,482" trend="+8%" />
          <MockKpi label="Value Recovered" value="$2.4M" trend="+12%" />
          <MockKpi label="Compliance" value="100%" trend="Audit-ready" />
        </div>

        {/* Chain of custody */}
        <div className="mt-4 rounded-2xl border border-gray-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">
              Chain of Custody — Batch #4821
            </p>
            <Truck aria-hidden className="size-3.5 text-blue-600" />
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {["Pickup", "Transit", "Wipe", "Grade", "Certify"].map(
              (step, i) => (
                <div key={step} className="flex flex-1 flex-col gap-1.5">
                  <div
                    className={
                      i < 3
                        ? "h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                        : "h-1.5 rounded-full bg-gray-200"
                    }
                  />
                  <span className="text-[9px] font-medium text-gray-500">
                    {step}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Wipe status + map row */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-center gap-2">
              <HardDrive aria-hidden className="size-3.5 text-blue-600" />
              <p className="text-xs font-semibold text-gray-700">
                Data Wipe Status
              </p>
            </div>
            <p className="mt-2 text-lg font-extrabold text-gray-900">
              1,204<span className="text-xs font-medium text-gray-400"> /1,210</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-[97%] rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1.5 text-[10px] text-gray-500">
              NIST 800-88 · 6 pending
            </p>
          </div>

          {/* Dot map */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-900 p-4">
            <p className="text-xs font-semibold text-white">Global Coverage</p>
            <div
              aria-hidden
              className="mt-2 h-16 opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "10px 10px",
                maskImage:
                  "radial-gradient(ellipse 90% 90% at 50% 40%, black 30%, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 90% 90% at 50% 40%, black 30%, transparent 80%)",
              }}
            />
            <span className="absolute left-8 top-9 size-1.5 animate-ping rounded-full bg-emerald-400" />
            <span className="absolute right-10 top-12 size-1.5 animate-ping rounded-full bg-blue-400 [animation-delay:0.8s]" />
            <span className="absolute bottom-6 left-1/2 size-1.5 animate-ping rounded-full bg-emerald-400 [animation-delay:1.6s]" />
            <p className="text-[10px] font-medium text-gray-400">
              120+ countries
            </p>
          </div>
        </div>

        {/* Compliance badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {["ISO 27001", "SOC 2", "NIST 800-88", "GDPR"].map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-700"
            >
              <CheckCircle2 aria-hidden className="size-3 text-emerald-500" />
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Floating chips */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-6 top-16 hidden rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:block"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-emerald-500/10">
            <ShieldCheck aria-hidden className="size-4 text-emerald-600" />
          </span>
          <div>
            <p className="text-xs font-bold text-gray-900">Wipe verified</p>
            <p className="text-[10px] text-gray-500">NIST 800-88 Purge</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -right-4 bottom-14 hidden rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:block"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-blue-600/10">
            <FileCheck aria-hidden className="size-4 text-blue-600" />
          </span>
          <div>
            <p className="text-xs font-bold text-gray-900">Certificate issued</p>
            <p className="text-[10px] text-gray-500">Serial #DL7440-0219</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MockKpi({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3">
      <p className="text-[10px] font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-base font-extrabold tracking-tight text-gray-900">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold text-emerald-600">{trend}</p>
    </div>
  );
}
