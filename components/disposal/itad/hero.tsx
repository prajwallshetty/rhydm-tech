"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CheckCircle2, Play } from "lucide-react";

import { BlurReveal } from "@/components/ui/accentry/blur-reveal";
import { WordReveal } from "@/components/ui/accentry/word-reveal";

export function ItadHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden bg-white pt-32 pb-20 sm:pt-40 sm:pb-32 text-slate-900"
      aria-labelledby="itad-hero-heading"
    >
      {/* Background Radial Ambient Glows & Fine Grid (Same backdrop as refurbished store hero) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft drifting green color fields */}
        <div className="animate-drift-slow absolute -left-40 -top-40 size-[38rem] rounded-full bg-[#2E6F40]/14 blur-3xl" />
        <div className="animate-drift-slower absolute -right-40 top-20 size-[34rem] rounded-full bg-[#2E6F40]/10 blur-3xl" />
        <div className="animate-drift-slow absolute bottom-[-18rem] left-1/3 size-[32rem] rounded-full bg-[#2E6F40]/8 blur-3xl" />

        {/* Fine grid pattern, faded out toward edges with subtle green lines */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(46, 111, 64, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(46, 111, 64, 0.12) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Left Column — Content */}
          <div className="lg:col-span-6">
            <BlurReveal delay={0.05}>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
                Enterprise ITAD & Data Destruction
              </p>
            </BlurReveal>

            <div className="mt-4">
              <h1
                id="itad-hero-heading"
                className="text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-6xl lg:text-7xl leading-[1.08]"
              >
                <WordReveal text="Global IT Asset Disposition." delay={0.1} />{" "}
                <span className="text-[#16A34A]">
                  <WordReveal text="Simplified." delay={0.3} />
                </span>
              </h1>
            </div>

            <BlurReveal delay={0.25}>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Securely retire, wipe, refurbish, recycle, redeploy, and recover maximum residual
                value from your enterprise IT assets across 120+ countries with full audit readiness.
              </p>
            </BlurReveal>

            {/* Action Buttons */}
            <BlurReveal delay={0.35}>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/disposal/contact"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-7 text-sm font-bold text-white shadow-md transition-all hover:bg-[#15803D] hover:shadow-lg active:scale-95"
                >
                  <span>Book a 30-Min Demo</span>
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href="#itad-process"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-7 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-400"
                >
                  <span>See How It Works</span>
                  <Play className="size-3.5 fill-slate-800" />
                </Link>
              </div>
            </BlurReveal>

            {/* Trust Pills */}
            <BlurReveal delay={0.45}>
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-8 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#16A34A]" />
                  <span>NIST 800-88 Wiping</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#16A34A]" />
                  <span>Serial-Level Certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#16A34A]" />
                  <span>120+ Countries</span>
                </div>
              </div>
            </BlurReveal>
          </div>

          {/* Right Column — Product Hero Image */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={
                reduceMotion
                  ? { opacity: 1, scale: 1, y: 0 }
                  : {
                      opacity: 1,
                      scale: 1,
                      y: [0, -10, 4, -10, 0],
                      rotate: [0, 1.2, -1, 1.2, 0],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                  : {
                      y: { duration: 10, ease: "easeInOut", repeat: Infinity },
                      rotate: { duration: 12, ease: "easeInOut", repeat: Infinity },
                      default: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                    }
              }
              className="relative mx-auto max-w-xl lg:max-w-none"
            >
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src="/disposalhero.png"
                  alt="Global IT Asset Disposition Hardware & Storage Infrastructure"
                  width={1200}
                  height={1000}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
