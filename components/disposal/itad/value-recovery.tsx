"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Banknote, Laptop2, RefreshCcw } from "lucide-react";

import { Counter } from "@/components/disposal/itad/counter";

export function ItadValueRecovery() {
  return (
    <section
      className="overflow-hidden bg-white py-24 sm:py-32"
      aria-labelledby="itad-value-heading"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            Value recovery
          </p>
          <h2
            id="itad-value-heading"
            className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 text-balance sm:text-5xl"
          >
            Recover More Than Just Hardware
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-600">
            Devices that pass testing are refurbished and resold through our own
            storefront and global channels — and a transparent share of every
            sale flows back to your budget.
          </p>

          <div className="mt-10 flex items-baseline gap-4">
            <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl">
              <Counter value={45} suffix="%" duration={1.8} />
            </span>
            <span className="text-lg font-semibold text-gray-500">
              average asset value
              <br />
              recovered
            </span>
          </div>

          <Link
            href="/refurbished"
            className="group mt-10 inline-flex items-center gap-2 text-base font-semibold text-blue-600"
          >
            See where devices get a second life
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Illustration: value flowing back from retired devices */}
        <div aria-hidden className="relative mx-auto w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative rounded-[32px] border border-gray-200 bg-slate-50 p-10"
          >
            {/* Retired device */}
            <div className="flex items-center justify-between">
              <div className="grid size-20 place-items-center rounded-3xl border border-gray-200 bg-white shadow-sm">
                <Laptop2 className="size-9 text-gray-400" strokeWidth={1.5} />
              </div>
              <RefreshCcw className="size-6 text-blue-600" />
              <div className="grid size-20 place-items-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10 shadow-sm">
                <Banknote className="size-9 text-emerald-600" strokeWidth={1.5} />
              </div>
            </div>

            {/* Flowing value dots */}
            <div className="relative mt-8 h-2 overflow-hidden rounded-full bg-gray-200">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ x: ["0%", "1150%"] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.8,
                  }}
                  className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                  style={{ left: "-4%" }}
                />
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Refurbished", value: "68%" },
                { label: "Recycled", value: "27%" },
                { label: "Redeployed", value: "5%" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-2xl border border-gray-200 bg-white px-3 py-4"
                >
                  <p className="text-xl font-extrabold text-gray-900">
                    {row.value}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-gray-500">
                    {row.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
