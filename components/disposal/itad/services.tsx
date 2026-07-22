"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { BlurReveal } from "@/components/ui/accentry/blur-reveal";
import { SpotlightCard } from "@/components/ui/accentry/spotlight-card";

export type ItadService = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  icon: string;
};

export function ItadServices({ services }: { services: ItadService[] }) {
  return (
    <section
      className="relative overflow-hidden bg-white py-24 sm:py-32"
      aria-labelledby="itad-services-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <BlurReveal>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
                END-TO-END CAPABILITIES
              </p>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <h2
                id="itad-services-heading"
                className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl"
              >
                Every Stage of Disposition, One Unified Platform
              </h2>
            </BlurReveal>
          </div>

          <BlurReveal delay={0.2}>
            <Link
              href="/disposal/services"
              className="group inline-flex min-h-11 items-center gap-1.5 py-2 -my-2 text-sm font-bold text-[#16A34A] hover:underline"
            >
              <span>Explore All Services</span>
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </BlurReveal>
        </div>

        {/* Centered Grid for incomplete rows (4 + 3 centered) */}
        <div className="mt-16 flex flex-wrap justify-center gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex-grow-0 shrink-0"
            >
              <Link href={`/disposal/services/${service.slug}`} className="block h-full">
                <SpotlightCard
                  spotlightColor="rgba(22, 163, 74, 0.12)"
                  borderColor="rgba(22, 163, 74, 0.35)"
                  className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all hover:border-[#16A34A]/40 hover:bg-white hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                      <span className="grid size-11 place-items-center rounded-xl bg-[#0F172A] text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:bg-[#16A34A]">
                        <Icon name={service.icon} className="size-5" strokeWidth={1.8} />
                      </span>
                      <span className="rounded-full bg-slate-200/60 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-700">
                        ACTIVE SERVICE
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold tracking-tight text-[#0F172A] group-hover:text-[#16A34A] transition-colors">
                      {service.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {service.summary}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-4 text-xs font-bold text-[#16A34A]">
                    <span>Technical Overview</span>
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </SpotlightCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
