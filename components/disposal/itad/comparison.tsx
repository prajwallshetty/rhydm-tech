"use client";

import { motion } from "motion/react";
import { Check, X } from "lucide-react";

const WITHOUT = [
  "Manual spreadsheets",
  "Multiple vendors per region",
  "Missing audit trail",
  "No resale — value written off",
  "Compliance gaps at handoffs",
  "Data risks on retired drives",
];

const WITH = [
  "Centralized dashboard",
  "Automated workflows",
  "Audit-ready by default",
  "Certified wiping, per device",
  "Global compliance coverage",
  "Asset value recovered",
];

export function ItadComparison() {
  return (
    <section
      className="bg-slate-50 py-24 sm:py-32"
      aria-labelledby="itad-comparison-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            The difference
          </p>
          <h2
            id="itad-comparison-heading"
            className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 text-balance sm:text-5xl"
          >
            Retire assets the old way, or the audited way
          </h2>
        </div>

        <div className="relative mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* Without */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="rounded-[28px] border border-gray-200 bg-white p-8 sm:p-10"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Without modern ITAD
            </p>
            <ul className="mt-7 space-y-4">
              {WITHOUT.map((item) => (
                <li key={item} className="flex items-center gap-3.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-red-50">
                    <X aria-hidden className="size-3.5 text-red-500" strokeWidth={2.6} />
                  </span>
                  <span className="text-[15px] text-gray-500">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* VS badge */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:grid"
          >
            <span className="grid size-14 place-items-center rounded-full border-4 border-slate-50 bg-gray-900 text-sm font-extrabold text-white shadow-xl">
              VS
            </span>
          </div>

          {/* With */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-[28px] border border-blue-600/20 bg-gray-900 p-8 shadow-[0_28px_70px_-28px_rgba(37,99,235,0.5)] sm:p-10"
          >
            <div
              aria-hidden
              className="absolute -right-20 -top-20 size-56 rounded-full bg-blue-600/25 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -left-20 size-56 rounded-full bg-emerald-500/20 blur-3xl"
            />

            <p className="relative text-sm font-bold uppercase tracking-widest text-emerald-400">
              With the platform
            </p>
            <ul className="relative mt-7 space-y-4">
              {WITH.map((item) => (
                <li key={item} className="flex items-center gap-3.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500/15">
                    <Check
                      aria-hidden
                      className="size-3.5 text-emerald-400"
                      strokeWidth={2.6}
                    />
                  </span>
                  <span className="text-[15px] font-medium text-white">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
