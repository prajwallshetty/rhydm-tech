"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import { ArrowRight, ShieldCheck, RefreshCw, Truck, Award, CheckCircle2 } from "lucide-react";

export function HeroRefurbishedMotion() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Parallax Transforms
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const y = useSpring(rawY, { stiffness: 200, damping: 25 });
  const scale = useSpring(rawScale, { stiffness: 200, damping: 25 });
  const opacity = useSpring(rawOpacity, { stiffness: 200, damping: 25 });

  // Mouse Parallax Rotation Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const trustBadges = [
    { icon: Award, label: "12 Months Warranty" },
    { icon: ShieldCheck, label: "Certified Quality" },
    { icon: RefreshCw, label: "30 Days Return" },
    { icon: Truck, label: "Secure Delivery" },
  ];

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full overflow-hidden bg-white text-slate-900 pt-28 pb-16 flex flex-col justify-between"
    >
      {/* Background Radial Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-10 h-[500px] w-[500px] rounded-full bg-[#2E6F40]/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Main Hero Container */}
      <div className="relative mx-auto max-w-7xl px-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Typography & CTAs */}
        <motion.div
          style={{ opacity }}
          className="lg:col-span-5 space-y-6 z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2.5">
              <span className="h-0.5 w-6 bg-[#2E6F40] rounded-full" />
              <span className="text-xs font-extrabold tracking-widest text-[#2E6F40] uppercase">
                PREMIUM REFURBISHED TECH
              </span>
            </div>
          </motion.div>

          {/* Headings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-1"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-[1.05]">
              Premium Refurbished Technology.
            </h1>
            <p className="text-3xl font-extrabold tracking-tight text-[#2E6F40] sm:text-4xl md:text-5xl">
              Built for professionals.
            </p>
          </motion.div>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal"
          >
            Professionally tested. Warranty included. Better for your business. Better for the planet.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Link
              href="/refurbished/shop"
              style={{ backgroundColor: "#2E6F40" }}
              className="group flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#2E6F40]/25 hover:brightness-110 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/refurbished/shop?sort=best-selling"
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-4 text-sm font-bold text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
            >
              <span>View Best Sellers</span>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200/80 pt-8 mt-8"
          >
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E6F40]/10 text-[#2E6F40] shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">
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
    </section>
  );
}
