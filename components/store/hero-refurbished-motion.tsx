"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Truck,
} from "lucide-react";

import type { StoreHeroContent } from "@/lib/cms/registry";

export function HeroRefurbishedMotion({ content }: { content: StoreHeroContent }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll animations for subtle scale/fade as user scrolls down
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const y = useSpring(rawY, { stiffness: 100, damping: 20 });
  const opacity = useSpring(rawOpacity, { stiffness: 100, damping: 20 });
  const scale = useSpring(rawScale, { stiffness: 100, damping: 20 });

  // Mouse parallax motion for 3D hero tilt
  const mouseX = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const rotateX = useTransform(mouseX, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-yPos * 8);
    rotateY.set(x * 8);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const trustBadges = [
    { icon: ShieldCheck, label: "12 Months Warranty" },
    { icon: CheckCircle2, label: "Certified Quality" },
    { icon: RotateCcw, label: "30 Days Return" },
    { icon: Truck, label: "Secure Delivery" },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[90vh] w-full overflow-hidden bg-white text-slate-900 pt-28 pb-16 flex flex-col justify-between"
    >
      {/* Background Radial Ambient Glows & Fine Grid (Same backdrop as Gateway with Green Touch) */}
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

      {/* Main Hero Container */}
      <div className="relative mx-auto max-w-7xl px-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Typography & CTAs */}
        <motion.div
          style={{ opacity }}
          className="lg:col-span-5 space-y-7 z-10"
        >
          {/* Sleek Glass Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2E6F40]/10 border border-[#2E6F40]/20 px-3.5 py-1.5 backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#2E6F40] animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest text-[#2E6F40] uppercase">
                {content.badge}
              </span>
            </div>
          </motion.div>

          {/* Premium Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="space-y-2"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-[-0.03em] leading-[1.08] text-slate-900">
              {content.headingMain}{" "}
              <span className="text-[#2E6F40] block mt-1 font-bold">
                {content.headingAccent}
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal"
          >
            {content.description}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center gap-3.5 pt-1"
          >
            <Link
              href={content.primaryHref}
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#2E6F40] hover:bg-[#255833] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2E6F40]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{content.primaryLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={content.secondaryHref}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-slate-100 px-7 py-3.5 text-sm font-semibold text-slate-900 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{content.secondaryLabel}</span>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200/80 pt-6 mt-6"
          >
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} className="flex items-center gap-2">
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
        </motion.div>

        {/* Right Column: Floating Laptop Hero Image with Mouse Parallax Tilt */}
        <motion.div
          style={{ y, scale, rotateX, rotateY, perspective: 1000 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:col-span-7 relative flex items-center justify-center h-full min-h-[450px] lg:min-h-[680px]"
        >
          <motion.div
            animate={{
              y: [0, -14, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="relative w-full h-full flex items-center justify-center lg:translate-x-6"
          >
            <img
              src="/hero.png"
              alt="Premium Refurbished Laptop"
              className="max-h-[600px] lg:max-h-[820px] w-full object-contain drop-shadow-2xl pointer-events-none scale-105 lg:scale-120"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
