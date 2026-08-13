"use client";

import { useTranslations } from "next-intl";
import { Download, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatPriceExact } from "@/lib/format";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

// Curated palette of premium colors for the particle burst
const PARTICLE_COLORS = [
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EF4444", // Rose
  "#8B5CF6", // Violet
  "#EC4899", // Pink
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  isRound: boolean;
}

interface OrderSuccessClientProps {
  orderNumber: string;
  totalCents: number;
  transactionId: string;
  token: string;
}

export default function OrderSuccessClient({
  orderNumber,
  totalCents,
  transactionId,
  token,
}: OrderSuccessClientProps) {
  const t = useTranslations("store.orderSuccess");
  const invoiceUrl = `/api/orders/${orderNumber}/invoice?token=${token}`;
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles on client mount to ensure Math.random is only called client-side
    const generated = Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24 + Math.random() * 15; // Spread evenly around 360 degrees
      const distance = 70 + Math.random() * 70; // Travel distance
      const rad = (angle * Math.PI) / 180;
      const x = Math.cos(rad) * distance;
      const y = Math.sin(rad) * distance;
      return {
        id: i,
        x,
        y,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size: Math.random() * 6 + 4, // size from 4px to 10px
        delay: Math.random() * 0.15,
        duration: 0.7 + Math.random() * 0.4,
        isRound: Math.random() > 0.5,
      };
    });
    
    // Set particles asynchronously in an animation frame to avoid synchronous setState inside useEffect
    const handle = requestAnimationFrame(() => {
      setParticles(generated);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  // Stagger variants for the container contents
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  } as const;

  return (
    <div className="mx-auto max-w-2xl px-6 pt-36 pb-24 text-center relative overflow-visible">
      {/* Decorative background glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-50/40 rounded-full blur-3xl -z-10" />

      {/* Pop-in Checkmark Badge & Confetti Container */}
      <div className="relative mx-auto w-16 h-16 mb-6 flex items-center justify-center">
        {/* Confetti Explosion Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: [0, 1.2, 0.6, 0],
              opacity: [1, 1, 0.7, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              borderRadius: p.isRound ? "50%" : "2px",
              zIndex: 10,
            }}
          />
        ))}

        {/* Outer Circular Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="w-full h-full flex items-center justify-center rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-100 shadow-sm relative z-20"
        >
          {/* SVG Animated Checkmark */}
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M20 6 9 17l-5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.4,
                ease: "easeInOut",
              }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* Main Headers */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t("paymentSuccessful")}
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Order Info Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left max-w-md mx-auto space-y-4 hover:shadow-md hover:border-slate-300 transition-all duration-300"
        >
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">{t("orderNumber")}</span>
            <span className="font-mono font-bold text-slate-950 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 shadow-2xs">
              {orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">{t("transactionId")}</span>
            <span
              className="font-mono font-medium text-slate-700 max-w-[180px] truncate text-right hover:text-slate-950 transition-colors cursor-help"
              title={transactionId}
            >
              {transactionId}
            </span>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm">
            <span className="text-slate-950 font-semibold">{t("totalPaid")}</span>
            <span className="text-lg font-black text-[#2E6F40] bg-emerald-50/50 px-2 py-0.5 rounded">
              {formatPriceExact(totalCents)}
            </span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col justify-center gap-4 sm:flex-row max-w-md mx-auto"
        >
          <motion.a
            href={invoiceUrl}
            download
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E6F40] text-white px-6 py-3.5 text-sm font-bold shadow-md shadow-[#2E6F40]/10 hover:bg-[#255833] hover:shadow-lg transition-all"
          >
            <Download className="size-4 animate-bounce" />
            {t("downloadInvoice")}
          </motion.a>
          
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/refurbished/shop"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 px-6 py-3.5 text-sm font-bold hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
            >
              <ShoppingBag className="size-4" />
              {t("continueShopping")}
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
