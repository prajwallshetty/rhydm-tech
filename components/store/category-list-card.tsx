"use client";

import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductThumb } from "@/components/store/product-thumb";

export function CategoryListCard({ category }: { category: any }) {
  const t = useTranslations("common");
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSpotlightPos({ x, y });

    // Subtle 3D Tilt
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(-((y - centerY) / centerY) * 5);
    setRotateY(((x - centerX) / centerX) * 5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:border-[#2E6F40]/30 hover:shadow-xl hover:shadow-[#2E6F40]/5"
    >
      {/* Spotlight cursor glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(46, 111, 64, 0.08), transparent 80%)`
            : "",
        }}
      />

      <div className="relative aspect-[16/9] bg-slate-50/50 p-6 border-b border-slate-100 overflow-hidden">
        {/* Soft grid background inside image area */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(46, 111, 64, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(46, 111, 64, 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Prefer a CMS-managed image; fall back to the generated placeholder. */}
        {category.thumbnailUrl || category.imageUrl ? (
          <img
            src={category.thumbnailUrl || category.imageUrl}
            alt={category.name}
            className="absolute inset-6 size-[calc(100%-3rem)] rounded-2xl object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
          />
        ) : (
          <ProductThumb
            slug={category.slug}
            category={category.slug}
            name={category.name}
            className="absolute inset-6 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
          />
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#2E6F40] transition-colors tracking-tight">
            {category.name}
          </h2>
          <span className="text-[10px] font-black text-[#2E6F40] bg-[#2E6F40]/10 border border-[#2E6F40]/10 rounded-full px-3 py-1 uppercase tracking-wider">
            {category._count?.products || "0"} Products
          </span>
        </div>
        <p className="mt-3 flex-1 text-xs leading-relaxed text-slate-500 font-medium">
          {category.description || t("categoryFallback", { name: category.name.toLowerCase() })}
        </p>
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            href={`/refurbished/categories/${category.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E6F40] hover:text-[#255833]"
          >
            <span>{t("browseProducts")}</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
