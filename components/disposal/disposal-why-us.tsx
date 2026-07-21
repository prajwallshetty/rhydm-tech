"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  ShieldCheck,
  Lock,
  Award,
  Clock,
  Leaf,
  DollarSign,
  CheckCircle,
} from "lucide-react";

const FEATURES = [
  {
    title: "10+ Years Regulated Experience",
    description:
      "Trusted by enterprise IT directors, healthcare systems, financial institutions, and government bodies across 1,200+ major estates.",
    icon: ShieldCheck,
    tag: "PROVEN TRACK RECORD",
  },
  {
    title: "Sealed Chain-of-Custody Vaults",
    description:
      "GPS-monitored vehicles, dual-key container locks, and vetted logistics staff ensure zero unauthorized media access.",
    icon: Lock,
    tag: "STRICT SECURITY",
  },
  {
    title: "Serial-Level Certificate Guarantee",
    description:
      "Every single hard drive, SSD, server node, and tape cartridge receives a unique verifiable certificate ready for audit inspection.",
    icon: Award,
    tag: "AUDIT PROOF",
  },
  {
    title: "48-Hour Metropolitan SLA",
    description:
      "Rapid turnaround logistics across all major metro areas. Scheduled weekend and off-hours site pickups available.",
    icon: Clock,
    tag: "FAST TURNAROUND",
  },
  {
    title: "100% Zero-Landfill Environmental Policy",
    description:
      "Raw materials are separated into circular manufacturing streams with audited R2v3 downstream partners. Full ESG report included.",
    icon: Leaf,
    tag: "ESG AUDITED",
  },
  {
    title: "Maximum Hardware Value Recovery",
    description:
      "Recover residual budget from high-spec laptops, workstations, and server hardware via direct global B2B remarketing channels.",
    icon: DollarSign,
    tag: "MAXIMUM ROI",
  },
];

function WhyUsCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-40px" });

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = feature.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSpotlightPos({ x, y });

    // Subtle 3D Tilt calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(-((y - centerY) / centerY) * 6);
    setRotateY(((x - centerX) / centerX) * 6);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-[#FAFDFB] p-7 shadow-sm transition-all duration-300 hover:border-[#2E6F40]/40 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60"
    >
      {/* Aceternity Spotlight Cursor Overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(46, 111, 64, 0.08), transparent 80%)`
            : "",
        }}
      />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#2E6F40]/10 text-[#2E6F40] transition-transform duration-300 group-hover:scale-110">
          <IconComponent className="size-6" />
        </div>
        <span className="rounded-full bg-[#2E6F40]/10 px-3 py-1 text-[10px] font-black tracking-widest text-[#2E6F40] uppercase">
          {feature.tag}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 mt-6 space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#2E6F40] transition-colors">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 font-normal">
          {feature.description}
        </p>
      </div>

      <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700">
        <CheckCircle className="size-4 text-[#2E6F40]" />
        <span>Enterprise SLA Guaranteed</span>
      </div>
    </motion.div>
  );
}

export function DisposalWhyUs() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

  return (
    <section className="relative py-24 sm:py-32 bg-[#FAFDFB] overflow-hidden border-t border-slate-200/60">
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
            <span className="size-2 rounded-full bg-[#2E6F40] animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2E6F40]">
              WHY ENTERPRISE CTOS CHOOSE RHYDM
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Built For Uncompromising Security Teams
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Eliminate liability risks with documented chain-of-custody, serial tracking, and zero-landfill environmental stewardship.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <WhyUsCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
