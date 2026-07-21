"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import {
  ArrowRight,
  Shield,
  HardDrive,
  Eraser,
  Recycle,
  Truck,
  Package,
  Award,
  CheckCircle2,
  Lock,
} from "lucide-react";

const SERVICES_DATA = [
  {
    slug: "secure-data-wiping",
    title: "Secure Data Wiping",
    summary:
      "NIST 800-88 compliant erasure across enterprise drives, arrays and mobile estates, with verifiable per-asset audit certificates.",
    icon: Eraser,
    tag: "NIST 800-88 REV 1",
    featured: true,
  },
  {
    slug: "hard-drive-destruction",
    title: "Hard Drive Destruction",
    summary:
      "On-site or in-facility high-torque shredding & degaussing for top-secret media that must never leave your custody intact.",
    icon: HardDrive,
    tag: "ON-SITE SHREDDING",
    featured: true,
  },
  {
    slug: "it-asset-disposal",
    title: "IT Asset Disposal (ITAD)",
    summary:
      "End-to-end decommissioning of server racks, enterprise laptops, network switches with complete serial inventory reconciliation.",
    icon: Shield,
    tag: "END-TO-END",
    featured: false,
  },
  {
    slug: "e-waste-recycling",
    title: "Zero-Landfill E-Waste Recycling",
    summary:
      "Audited downstream material recovery with 100% zero-landfill guarantee for your ESG environmental reporting.",
    icon: Recycle,
    tag: "ESG CERTIFIED",
    featured: false,
  },
  {
    slug: "corporate-pickup",
    title: "GPS-Tracked Insured Transport",
    summary:
      "Scheduled collection in sealed tamper-evident containers with GPS-monitored vehicles and chain-of-custody logging.",
    icon: Truck,
    tag: "48H METRO SLA",
    featured: false,
  },
  {
    slug: "asset-recovery",
    title: "Enterprise Asset Value Recovery",
    summary:
      "Maximize residual ROI from retired server & laptop fleets via direct remarketing with transparent revenue share.",
    icon: Package,
    tag: "ROI RECOVERY",
    featured: false,
  },
  {
    slug: "certificates-of-destruction",
    title: "Serial-Level Audit Certificates",
    summary:
      "Tamper-proof digital certificates containing serial numbers, wiping logs & technician signatures ready for auditors.",
    icon: Award,
    tag: "AUDIT READY",
    featured: false,
  },
];

function BentoCard({
  service,
  index,
  spanTwoCols = false,
}: {
  service: (typeof SERVICES_DATA)[number];
  index: number;
  spanTwoCols?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-40px" });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = service.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2E6F40]/40 hover:shadow-xl hover:shadow-slate-200/60 ${
        spanTwoCols ? "lg:col-span-2" : "col-span-1"
      }`}
    >
      {/* Aceternity Mouse Spotlight Radial Glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(450px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(46, 111, 64, 0.09), transparent 80%)`
            : "",
        }}
      />

      {/* Top Tag & Icon */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#2E6F40]/10 border border-[#2E6F40]/20 text-[#2E6F40] transition-transform duration-300 group-hover:scale-110">
          <IconComponent className="size-6" />
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black tracking-wider text-slate-600 uppercase border border-slate-200/60">
          {service.tag}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 mt-6 space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#2E6F40] transition-colors">
          {service.title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 font-normal">
          {service.summary}
        </p>
      </div>

      {/* Card Action Link */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          href={`/disposal/services/${service.slug}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2E6F40] hover:text-[#255833] transition-colors"
        >
          <span>View Specifications & SLA</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
        <CheckCircle2 className="size-4 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
      </div>
    </motion.div>
  );
}

export function DisposalServicesBento() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

  return (
    <section className="relative py-24 sm:py-32 bg-[#FAFDFB] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -left-20 top-1/3 size-[30rem] rounded-full bg-[#2E6F40]/8 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2E6F40]/10 border border-[#2E6F40]/20 px-3.5 py-1.5">
            <Lock className="size-3.5 text-[#2E6F40]" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2E6F40]">
              ENTERPRISE DECOMMISSIONING SERVICES
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Comprehensive ITAD Solutions.{" "}
            <span className="text-[#2E6F40] block">Every Asset Accounted For.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Engage an individual certified service or hand over your complete estate decommissioning. Serialized tracking guarantees total compliance.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BentoCard service={SERVICES_DATA[0]} index={0} spanTwoCols />
          <BentoCard service={SERVICES_DATA[1]} index={1} />
          <BentoCard service={SERVICES_DATA[2]} index={2} />
          <BentoCard service={SERVICES_DATA[3]} index={3} />
          <BentoCard service={SERVICES_DATA[4]} index={4} />
          <BentoCard service={SERVICES_DATA[5]} index={5} spanTwoCols />
          <BentoCard service={SERVICES_DATA[6]} index={6} />
        </div>
      </div>
    </section>
  );
}
