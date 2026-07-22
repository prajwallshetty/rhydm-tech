"use client";

import { motion } from "motion/react";
import { BadgeCheck } from "lucide-react";

export type ItadCertification = {
  id: string;
  name: string;
  issuer: string | null;
  description: string | null;
};

/**
 * Compliance cards, driven by the Certification table (managed in the admin
 * CMS). The animated ring draws itself when each badge scrolls into view.
 */
export function ItadCompliance({
  certifications,
}: {
  certifications: ItadCertification[];
}) {
  return (
    <section
      className="bg-slate-50 py-24 sm:py-32"
      aria-labelledby="itad-compliance-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Compliance
          </p>
          <h2
            id="itad-compliance-heading"
            className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 text-balance sm:text-5xl"
          >
            Built for the frameworks you answer to
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Certifications govern how we operate. The documentation you receive
            is what proves it — years after the pickup.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {certifications.map((cert, i) => (
            <motion.article
              key={cert.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 5) * 0.08 }}
              whileHover={{ y: -5 }}
              className="rounded-[24px] border border-gray-200 bg-white p-7 text-center transition-shadow duration-300 hover:shadow-[0_20px_50px_-24px_rgba(17,24,39,0.2)]"
            >
              {/* Animated badge ring */}
              <div className="relative mx-auto size-16">
                <svg viewBox="0 0 64 64" className="absolute inset-0" aria-hidden>
                  <circle
                    cx="32"
                    cy="32"
                    r="29"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="2.5"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="29"
                    fill="none"
                    stroke="url(#itad-badge-gradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="182"
                    initial={{ strokeDashoffset: 182 }}
                    whileInView={{ strokeDashoffset: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.2 + i * 0.08 }}
                    transform="rotate(-90 32 32)"
                  />
                  <defs>
                    <linearGradient
                      id="itad-badge-gradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 grid place-items-center">
                  <BadgeCheck
                    aria-hidden
                    className="size-7 text-blue-600"
                    strokeWidth={1.8}
                  />
                </span>
              </div>

              <h3 className="mt-5 text-base font-bold tracking-tight text-gray-900">
                {cert.name}
              </h3>
              {cert.issuer && (
                <p className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-blue-600">
                  {cert.issuer}
                </p>
              )}
              <p className="mt-2.5 text-[13px] leading-relaxed text-gray-500">
                {cert.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
