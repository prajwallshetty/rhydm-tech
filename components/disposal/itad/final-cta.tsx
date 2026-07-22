"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function ItadFinalCta() {
  return (
    <section
      className="relative overflow-hidden bg-gray-900 py-28 sm:py-36"
      aria-labelledby="itad-final-cta-heading"
    >
      {/* Ambient gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-drift-slow absolute -left-32 -top-32 size-[36rem] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="animate-drift-slower absolute -bottom-40 -right-32 size-[34rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 75%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-4xl px-6 text-center"
      >
        <h2
          id="itad-final-cta-heading"
          className="text-4xl font-extrabold tracking-tight text-white text-balance sm:text-5xl lg:text-6xl"
        >
          End Every IT Asset&rsquo;s Lifecycle Securely.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400 text-pretty">
          Protect sensitive data, stay compliant, recover value, and simplify
          global IT asset disposition from one platform.
        </p>

        <div className="mt-11 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/disposal/contact"
            className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-gray-900 shadow-xl transition-all hover:bg-gradient-to-r hover:from-blue-600 hover:to-emerald-500 hover:text-white"
          >
            Book Demo
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/disposal/contact"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/25 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            Talk to an Expert
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Serial-level certificates · 48-hour pickup · 120+ countries
        </p>
      </motion.div>
    </section>
  );
}
