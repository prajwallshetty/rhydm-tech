"use client";

import { motion } from "motion/react";
import {
  Award,
  FileSearch,
  Globe2,
  Link2,
  Recycle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

const CARDS = [
  {
    icon: ShieldCheck,
    title: "Certified Data Erasure",
    body: "NIST 800-88 wiping with per-device verification. Drives that fail are physically destroyed — never resold.",
    className: "lg:col-span-2",
    accent: "from-blue-600 to-blue-400",
  },
  {
    icon: Globe2,
    title: "Global Asset Tracking",
    body: "One dashboard for every asset in every country, from pickup to certificate.",
    accent: "from-emerald-500 to-teal-400",
  },
  {
    icon: Link2,
    title: "Chain of Custody",
    body: "GPS-tracked transport, tamper-evident seals, and a timestamped record for every handoff.",
    accent: "from-blue-600 to-indigo-400",
  },
  {
    icon: TrendingUp,
    title: "Asset Recovery",
    body: "Residual value flows back through refurbishment and global resale, with transparent revenue share.",
    accent: "from-emerald-500 to-green-400",
  },
  {
    icon: FileSearch,
    title: "Compliance Automation",
    body: "Audit-ready documentation generated automatically — GDPR, HIPAA, SOX — without chasing vendors.",
    className: "lg:col-span-2",
    accent: "from-indigo-500 to-blue-400",
  },
  {
    icon: Recycle,
    title: "Sustainable Recycling",
    body: "Zero-landfill policy with audited downstream partners and ESG-ready impact reports.",
    className: "lg:col-span-3",
    accent: "from-emerald-500 to-lime-400",
    wide: true,
  },
];

export function ItadWhyBento() {
  return (
    <section className="bg-white py-24 sm:py-32" aria-labelledby="itad-why-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Why ITAD
          </p>
          <h2
            id="itad-why-heading"
            className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 text-balance sm:text-5xl"
          >
            Why Modern IT Teams Need Enterprise ITAD
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Retiring hardware is the moment your data is most exposed and your
            budget is most recoverable. Both deserve more than a spreadsheet.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -5 }}
              className={cn(
                "group relative overflow-hidden rounded-[28px] border border-gray-200 bg-slate-50 p-8 transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_rgba(17,24,39,0.18)]",
                card.className,
              )}
            >
              {/* Corner glow on hover */}
              <div
                aria-hidden
                className={cn(
                  "absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20",
                  card.accent,
                )}
              />

              <span
                className={cn(
                  "relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md",
                  card.accent,
                )}
              >
                <card.icon aria-hidden className="size-6" strokeWidth={1.8} />
              </span>

              <h3 className="relative mt-6 text-xl font-bold tracking-tight text-gray-900">
                {card.title}
              </h3>
              <p
                className={cn(
                  "relative mt-2.5 text-[15px] leading-relaxed text-gray-600",
                  card.wide && "max-w-2xl",
                )}
              >
                {card.body}
              </p>

              {card.wide && (
                <div
                  aria-hidden
                  className="absolute bottom-6 right-8 hidden items-center gap-1.5 lg:flex"
                >
                  <Award className="size-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-500">
                    100% zero-landfill since day one
                  </span>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
