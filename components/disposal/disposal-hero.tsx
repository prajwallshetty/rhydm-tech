"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Fingerprint,
  CheckCircle2,
  FileCheck2,
  Lock,
  Building2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animated counter component                                         */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const stepTime = 16;
    const steps = Math.ceil(duration / stepTime);
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section (Spotlight + 3D Tilt Card + Light Rhydm Theme)        */
/* ------------------------------------------------------------------ */
export function DisposalHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse spotlight coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D Parallax Tilt for right card
  const cardRotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), { stiffness: 150, damping: 20 });
  const cardRotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x - rect.width / 2);
    mouseY.set(y - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const stats = [
    { value: 2400000, suffix: "+", label: "Assets Decommissioned" },
    { value: 100, suffix: "%", label: "Zero-Landfill Guarantee" },
    { value: 48, suffix: "h", label: "Metro Pickup SLA" },
    { value: 0, suffix: "", label: "Data Breach Incidents" },
  ];

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] w-full overflow-hidden bg-[#FAFCFB] text-slate-900 pt-28 pb-20 flex flex-col justify-between"
    >
      {/* ── Background Radial Ambient Glows & Fine Grid (Same as / and /refurbished) ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft drifting green color fields */}
        <div className="animate-drift-slow absolute -left-40 -top-40 size-[42rem] rounded-full bg-[#2E6F40]/14 blur-3xl" />
        <div className="animate-drift-slower absolute -right-40 top-10 size-[38rem] rounded-full bg-[#2E6F40]/10 blur-3xl" />
        <div className="animate-drift-slow absolute bottom-[-18rem] left-1/3 size-[36rem] rounded-full bg-[#2E6F40]/8 blur-3xl" />

        {/* Aceternity Cursor Spotlight Overlay */}
        <motion.div
          className="absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mouseX.get() + 600}px ${mouseY.get() + 400}px, rgba(46, 111, 64, 0.08), transparent 80%)`,
          }}
        />

        {/* Fine grid pattern masked with radial gradient */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(46, 111, 64, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(46, 111, 64, 0.12) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 85% 65% at 50% 40%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 65% at 50% 40%, black 30%, transparent 75%)",
          }}
        />
      </div>

      {/* ── Hero Container ── */}
      <div className="relative mx-auto max-w-7xl px-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline & Action Controls */}
        <div className="lg:col-span-6 space-y-7 z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2E6F40]/10 border border-[#2E6F40]/20 px-4 py-1.5 backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#2E6F40] animate-pulse" />
              <span className="text-[11px] font-extrabold tracking-widest text-[#2E6F40] uppercase">
                ISO 27001 · R2v3 · NIST 800-88 REV 1
              </span>
            </div>
          </motion.div>

          {/* Staggered Text Title */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-2"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-[-0.03em] leading-[1.08] text-slate-900">
              Retire Enterprise IT.{" "}
              <span className="text-[#2E6F40] block font-extrabold mt-1">
                Zero Risk. 100% Audit-Ready.
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal"
          >
            Certified data wiping, on-site drive destruction, and zero-landfill e-waste recycling — backed by serial-level certificates for your compliance auditor.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-4 pt-1"
          >
            <Link
              href="/disposal/contact"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#2E6F40] hover:bg-[#255833] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#2E6F40]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Request Secure Pickup</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/disposal/process"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 hover:bg-slate-100 px-7 py-4 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explore 7-Step Process</span>
            </Link>
          </motion.div>

          {/* Trust Badges Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200/80 pt-6 mt-6"
          >
            {[
              { icon: ShieldCheck, label: "NIST 800-88" },
              { icon: Lock, label: "GPS Custody" },
              { icon: Award, label: "R2v3 Certified" },
              { icon: FileCheck2, label: "Serial Audits" },
            ].map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E6F40]/10 text-[#2E6F40] shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Column: Aceternity 3D Tilt Image */}
        <motion.div
          style={{ rotateX: cardRotateX, rotateY: cardRotateY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:col-span-6 relative flex items-center justify-center min-h-[400px]"
        >
          <motion.div
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <img
              src="/dishero.png"
              alt="IT Asset Decommissioning and Disposal Services"
              className="max-h-[520px] w-full object-contain drop-shadow-2xl pointer-events-none scale-105"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Stats Bar at Hero Bottom ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 rounded-3xl border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-md"
        >
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stat.value === 0 ? (
                  <span className="text-[#2E6F40]">0 Defect</span>
                ) : (
                  <AnimatedCounter
                    value={stat.value >= 1000000 ? stat.value / 1000000 : stat.value}
                    suffix={stat.value >= 1000000 ? "M+" : stat.suffix}
                  />
                )}
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
