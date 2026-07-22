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
} from "lucide-react";

/**
 * Large dashboard showcase — an expanded, static rendering of the product UI
 * in glass cards. Markup, not imagery: crisp at any width, zero payload.
 */
export function ItadShowcase() {
  return (
    <section
      className="relative overflow-hidden bg-gray-900 py-24 sm:py-32"
      aria-labelledby="itad-showcase-heading"
    >
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 size-[34rem] rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 size-[30rem] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            Platform
          </p>
          <h2
            id="itad-showcase-heading"
            className="mt-4 text-4xl font-extrabold tracking-tight text-white text-balance sm:text-5xl"
          >
            Your entire IT estate&rsquo;s exit, on one screen
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-400">
            Lifecycle, custody, compliance and recovered value — visible in real
            time, exportable for auditors.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Asset lifecycle — wide */}
          <GlassCard className="sm:col-span-2">
            <CardHeader icon={BarChart3} title="Asset Lifecycle" />
            <div className="mt-4 flex items-end gap-2" aria-hidden>
              {[35, 55, 42, 70, 62, 85, 78, 96].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height * 0.8}px` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.06 }}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400"
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Devices processed, last 8 quarters
            </p>
          </GlassCard>

          {/* Recovery value */}
          <GlassCard>
            <CardHeader icon={Award} title="Recovery Value" />
            <p className="mt-4 text-3xl font-extrabold text-white">$2.4M</p>
            <p className="mt-1 text-xs font-semibold text-emerald-400">
              +12% vs last quarter
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "72%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4 }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">72% of forecast</p>
          </GlassCard>

          {/* Compliance */}
          <GlassCard>
            <CardHeader icon={FileCheck} title="Compliance Status" />
            <p className="mt-4 text-3xl font-extrabold text-white">100%</p>
            <p className="mt-1 text-xs text-gray-400">Audit-ready</p>
            <div className="mt-4 space-y-2">
              {["Certificates issued", "Wipe logs archived"].map((row) => (
                <div key={row} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{row}</span>
                  <span className="text-xs font-bold text-emerald-400">✓</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Global map — wide */}
          <GlassCard className="sm:col-span-2">
            <CardHeader icon={Globe2} title="Global Map" />
            <div
              aria-hidden
              className="relative mt-4 h-28 rounded-xl bg-white/5"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
                backgroundSize: "12px 12px",
                maskImage:
                  "radial-gradient(ellipse 85% 85% at 50% 45%, black 30%, transparent 82%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 85% 85% at 50% 45%, black 30%, transparent 82%)",
              }}
            >
              <span className="absolute left-[18%] top-[32%] size-2 animate-ping rounded-full bg-emerald-400" />
              <span className="absolute left-[46%] top-[24%] size-2 animate-ping rounded-full bg-blue-400 [animation-delay:0.7s]" />
              <span className="absolute left-[70%] top-[44%] size-2 animate-ping rounded-full bg-emerald-400 [animation-delay:1.4s]" />
              <span className="absolute left-[32%] top-[62%] size-2 animate-ping rounded-full bg-blue-400 [animation-delay:2.1s]" />
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Active pickups across 120+ countries
            </p>
          </GlassCard>

          {/* Device status */}
          <GlassCard>
            <CardHeader icon={HardDrive} title="Device Status" />
            <div className="mt-4 space-y-3">
              {[
                { label: "Wiped", pct: 82, tone: "bg-emerald-500" },
                { label: "In transit", pct: 11, tone: "bg-blue-500" },
                { label: "Queued", pct: 7, tone: "bg-gray-500" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{row.label}</span>
                    <span className="font-semibold text-white">{row.pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={`h-full rounded-full ${row.tone}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Chain of custody */}
          <GlassCard>
            <CardHeader icon={Link2} title="Chain of Custody" />
            <ol className="mt-4 space-y-2.5">
              {[
                "Collected — 09:12",
                "Sealed — 09:26",
                "Facility intake — 14:03",
                "Wipe verified — 17:41",
              ].map((event, i) => (
                <li key={event} className="flex items-center gap-2.5">
                  <span
                    className={`size-1.5 rounded-full ${i < 3 ? "bg-emerald-400" : "bg-blue-400"}`}
                  />
                  <span className="text-xs text-gray-300">{event}</span>
                </li>
              ))}
            </ol>
          </GlassCard>
        </motion.div>

        {/* Footer strip inside showcase */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
          <span className="inline-flex items-center gap-2">
            <Recycle aria-hidden className="size-4 text-emerald-400" />
            Zero-landfill verified
          </span>
          <span className="inline-flex items-center gap-2">
            <FileCheck aria-hidden className="size-4 text-emerald-400" />
            Certificates exportable as PDF/CSV
          </span>
          <span className="inline-flex items-center gap-2">
            <Globe2 aria-hidden className="size-4 text-emerald-400" />
            Regional data residency
          </span>
        </div>
      </div>
    </section>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
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
    <div className="flex items-center gap-2.5">
      <Icon aria-hidden className="size-4 text-blue-400" strokeWidth={1.8} />
      <h3 className="text-sm font-bold text-white">{title}</h3>
    </div>
  );
}
