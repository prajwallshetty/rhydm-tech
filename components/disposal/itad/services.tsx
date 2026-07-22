"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Icon } from "@/components/icon";

export type ItadService = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  icon: string;
};

/**
 * Service cards, driven by the Disposal CMS (DisposalService rows) rather
 * than hardcoded copy — edits in /admin/disposal appear here without a deploy.
 */
export function ItadServices({ services }: { services: ItadService[] }) {
  return (
    <section
      className="bg-slate-50 py-24 sm:py-32"
      aria-labelledby="itad-services-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Services
            </p>
            <h2
              id="itad-services-heading"
              className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 text-balance sm:text-5xl"
            >
              Every stage of disposition, one platform
            </h2>
          </div>
          <Link
            href="/disposal/services"
            className="group inline-flex items-center gap-2 text-base font-semibold text-blue-600"
          >
            All services
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
              className="group relative"
            >
              {/* Hover glow */}
              <div
                aria-hidden
                className="absolute -inset-px rounded-[26px] bg-gradient-to-br from-blue-600/40 via-transparent to-emerald-500/40 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100"
              />

              <Link
                href={`/disposal/services/${service.slug}`}
                className="relative flex h-full flex-col rounded-[24px] border border-gray-200 bg-white p-8 transition-shadow duration-300 group-hover:shadow-[0_20px_50px_-20px_rgba(37,99,235,0.25)]"
              >
                <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 text-blue-600 ring-1 ring-gray-200 transition-transform duration-300 group-hover:scale-105">
                  <Icon name={service.icon} className="size-7" strokeWidth={1.7} />
                </span>

                <h3 className="mt-6 text-lg font-bold tracking-tight text-gray-900">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-gray-600">
                  {service.summary}
                </p>

                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  Learn More
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1.5"
                  />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
