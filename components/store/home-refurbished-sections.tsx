"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Award,
  RotateCcw,
  Truck,
  Leaf,
  CheckCircle2,
  Cpu,
  Laptop,
  Monitor,
  Server,
  Network,
  HardDrive,
  Headphones,
  Box,
  ShoppingCart,
  Heart,
  Sparkles,
} from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useStore } from "@/lib/store/cart";
import { ProductCard } from "@/components/store/product-card";

import { useState, useRef } from "react";

function CategoryCard({
  cat,
  index,
  getCategoryIcon,
}: {
  cat: any;
  index: number;
  getCategoryIcon: (slug: string) => any;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = getCategoryIcon(cat.slug);

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-50/40 p-6 shadow-2xs transition-all duration-300 hover:border-[#2E6F40]/30 hover:bg-white hover:shadow-xl hover:shadow-[#2E6F40]/5"
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(350px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(46, 111, 64, 0.08), transparent 80%)`
            : "",
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[170px]">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#2E6F40] shadow-2xs transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2E6F40] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#2E6F40]/25">
            <IconComponent className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black text-[#2E6F40] bg-[#2E6F40]/10 border border-[#2E6F40]/10 rounded-full px-3 py-1 uppercase tracking-wider">
            {cat._count?.products || "0"} Units
          </span>
        </div>

        <div className="mt-6 space-y-1">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2E6F40] transition-colors tracking-tight">
            {cat.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {cat.description || `Explore our high-quality premium certified refurbished ${cat.name.toLowerCase()}.`}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100/60 flex items-center justify-between">
          <Link
            href={`/refurbished/categories/${cat.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E6F40] hover:text-[#255833] transition-colors"
          >
            <span>Explore Collection</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function HomeRefurbishedSections({
  categories,
  featuredProducts,
  bestSellers,
  brands,
}: {
  categories: any[];
  featuredProducts: any[];
  bestSellers: any[];
  brands: any[];
}) {
  const addToCart = useStore((s) => s.addToCart);

  // Category Icon Mapping
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "laptops": return Laptop;
      case "desktops": return Monitor;
      case "servers": return Server;
      case "networking": return Network;
      case "storage": return HardDrive;
      case "accessories": return Headphones;
      case "monitors": return Monitor;
      default: return Cpu;
    }
  };



  // Why Choose Us Feature Cards
  const featureCards = [
    {
      icon: ShieldCheck,
      title: "Certified Devices",
      description: "Every unit undergoes a rigorous 40-point hardware & functional inspection.",
    },
    {
      icon: Award,
      title: "12-Month Warranty Included",
      description: "Full return-to-base coverage with extended 24 & 36-month options.",
    },
    {
      icon: CheckCircle2,
      title: "Professionally Tested",
      description: "Storage sanitized to NIST 800-88 standards for guaranteed data security.",
    },
    {
      icon: Truck,
      title: "Fast & Secure Shipping",
      description: "Tracked dispatch within 24 hours with custom protective transit packaging.",
    },
    {
      icon: Leaf,
      title: "100% Eco Friendly",
      description: "Reduces e-waste and carbon footprint without sacrificing performance.",
    },
    {
      icon: Box,
      title: "Business Ready Batches",
      description: "Identical spec matching available for bulk company team rollouts.",
    },
  ];

  return (
    <div className="space-y-24 bg-white text-slate-900 py-16">
      {/* 1. Shop by Category */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E6F40]">Categories</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/refurbished/categories"
            className="flex items-center gap-1.5 text-xs font-bold text-[#2E6F40] hover:brightness-125 transition-colors"
          >
            <span>View all categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <CategoryCard key={cat.id} cat={cat} index={idx} getCategoryIcon={getCategoryIcon} />
          ))}
        </div>
      </section>

      {/* 2. Featured Products */}

      {/* 3. Featured Products */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E6F40]">Featured Devices</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mt-1">
              Popular Certified Laptops & Workstations
            </h2>
          </div>
          <Link
            href="/refurbished/shop"
            className="flex items-center gap-1.5 text-xs font-bold text-[#2E6F40] hover:brightness-125 transition-colors"
          >
            <span>View all products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Why Choose Us */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="border-b border-slate-200 pb-6 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E6F40]">Why Rhydm</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mt-1">
            Built to Exceed Enterprise Standards
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                className="rounded-[32px] border border-slate-200/80 bg-slate-50/60 p-8 shadow-sm hover:border-[#2E6F40]/30 hover:bg-white hover:shadow-xl transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2E6F40] text-white shadow-lg shadow-[#2E6F40]/20 mb-6">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. Brand Logos Carousel */}
      <section className="mx-auto max-w-7xl px-6 border-y border-slate-200/80 py-12">
        <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          Trusted Manufacturers We Stock & Restore
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80">
          {["Apple", "Dell", "HP", "Lenovo", "ASUS", "Cisco", "Intel", "Samsung"].map((brandName) => (
            <motion.span
              key={brandName}
              whileHover={{ scale: 1.1, opacity: 1 }}
              className="text-xl font-black text-slate-400 hover:text-slate-900 transition-all cursor-pointer font-mono tracking-tight"
            >
              {brandName}
            </motion.span>
          ))}
        </div>
      </section>

      {/* 6. Premium Newsletter Section */}
      <section className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ backgroundColor: "#2E6F40" }}
          className="rounded-[40px] p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="rounded-full bg-white/20 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white border border-white/30">
              STAY INSPIRED
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Get Early Access to Inventory Drops
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              Corporate fleet refreshes move fast. Subscribe to receive matching lot releases before they hit the catalog.
            </p>

            <form action="/refurbished" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
              <input
                type="email"
                required
                placeholder="Enter work email..."
                className="flex-1 rounded-full border border-white/30 bg-white/10 px-5 py-3.5 text-xs text-white placeholder:text-white/60 outline-none backdrop-blur-md focus:border-white"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-7 py-3.5 text-xs font-bold text-slate-900 shadow-xl hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
