"use client";

import { motion } from "motion/react";
import {
  ChevronRight,
  Laptop2,
  PackageOpen,
  Recycle,
  Settings2,
  ShieldCheck,
  Undo2,
} from "lucide-react";

import { cn } from "@/lib/utils";

const STAGES = [
  { icon: PackageOpen, label: "Procure" },
  { icon: Laptop2, label: "Deploy" },
  { icon: Settings2, label: "Manage" },
  { icon: ShieldCheck, label: "Secure" },
  { icon: Undo2, label: "Retrieve" },
  { icon: Recycle, label: "ITAD", current: true },
];

/**
 * Device-lifecycle roadmap with the current page's stage highlighted —
 * positions ITAD as the final step of a larger platform story.
 */
export function ItadLifecycle() {
  return (
    <section
      className="bg-slate-50 py-24 sm:py-28"
      aria-labelledby="itad-lifecycle-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            The full lifecycle
          </p>
          <h2
            id="itad-lifecycle-heading"
            className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 text-balance sm:text-5xl"
          >
            ITAD is the last mile of device management
          </h2>
        </div>

        <ol className="mt-16 flex flex-wrap items-center justify-center gap-y-6">
          {STAGES.map((stage, i) => (
            <li key={stage.label} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                aria-current={stage.current ? "step" : undefined}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-[24px] border px-7 py-6 transition-shadow",
                  stage.current
                    ? "border-blue-600/30 bg-gray-900 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.45)]"
                    : "border-gray-200 bg-white",
                )}
              >
                <stage.icon
                  aria-hidden
                  className={cn(
                    "size-6",
                    stage.current ? "text-emerald-400" : "text-gray-400",
                  )}
                  strokeWidth={1.8}
                />
                <span
                  className={cn(
                    "text-sm font-bold tracking-tight",
                    stage.current ? "text-white" : "text-gray-700",
                  )}
                >
                  {stage.label}
                </span>
                {stage.current && (
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    You are here
                  </span>
                )}
              </motion.div>

              {i < STAGES.length - 1 && (
                <ChevronRight
                  aria-hidden
                  className="mx-2 size-5 shrink-0 text-gray-300 sm:mx-3"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
