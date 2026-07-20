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

  // Ather Energy style 4 Editorial Cards Data
  const editorialCards = [
    {
      title: "Enterprise Laptops",
      subtitle: "Built for Business",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop",
      href: "/refurbished/categories/laptops",
      tag: "FLAGSHIP",
    },
    {
      title: "Gaming & Workstations",
      subtitle: "Maximum Performance",
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1000&auto=format&fit=crop",
      href: "/refurbished/categories/desktops",
      tag: "PRO GRADE",
    },
    {
      title: "Networking Equipment",
      subtitle: "High-Speed Infrastructure",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop",
      href: "/refurbished/categories/networking",
      tag: "ENTERPRISE",
    },
    {
      title: "Storage Solutions",
      subtitle: "Enterprise Grade Data",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop",
      href: "/refurbished/categories/storage",
      tag: "SECURE",
    },
  ];

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
          {categories.map((cat, idx) => {
            const IconComponent = getCategoryIcon(cat.slug);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <Link
                  href={`/refurbished/categories/${cat.slug}`}
                  className="group flex flex-col justify-between rounded-[32px] border border-slate-200/80 bg-slate-50/60 p-6 shadow-sm hover:border-[#2E6F40]/40 hover:bg-white hover:shadow-xl hover:shadow-[#2E6F40]/5 transition-all duration-300 h-full min-h-[160px]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-[#2E6F40] shadow-sm group-hover:scale-110 group-hover:bg-[#2E6F40] group-hover:text-white transition-all">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-200/60 rounded-full px-2.5 py-0.5">
                      {cat._count?.products || "50+"} Units
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2E6F40] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Explore collection →</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 2. Ather Energy Style 4 Editorial Cards */}
      <section className="mx-auto max-w-7xl px-6 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E6F40]">Featured Collections</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mt-1">
            Engineered for High-Performance Work
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {editorialCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="group relative h-[420px] w-full overflow-hidden rounded-[40px] shadow-2xl"
            >
              {/* Image */}
              <img
                src={card.image}
                alt={card.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Solid Tint Overlay (No Gradient) */}
              <div className="absolute inset-0 bg-slate-950/60 p-8 sm:p-10 flex flex-col justify-between" />

              {/* Content */}
              <div className="relative z-10 flex items-start justify-between">
                <span className="rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white border border-white/30">
                  {card.tag}
                </span>
              </div>

              <div className="relative z-10 space-y-3">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-300 mt-1">
                    {card.subtitle}
                  </p>
                </div>

                <Link
                  href={card.href}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-slate-900 shadow-xl hover:bg-[#2E6F40] hover:text-white transition-all hover:scale-105 active:scale-95"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

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
              whileHover={{ y: -8 }}
              className="group flex flex-col justify-between rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm hover:shadow-2xl hover:border-[#2E6F40]/30 transition-all duration-300"
            >
              <div>
                {/* Image Box */}
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center p-4">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-extrabold text-slate-400 text-xs">
                      {product.brand?.name || "RH YD M"}
                    </div>
                  )}

                  <span className="absolute top-3 left-3 rounded-full bg-[#2E6F40] px-2.5 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider">
                    {product.condition || "GRADE A"}
                  </span>
                </div>

                {/* Product Info */}
                <div className="mt-4 space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {product.brand?.name || "Certified Refurbished"}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#2E6F40] transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{product.shortDescription}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-lg font-black text-slate-900">
                    {formatMoney(product.priceCents)}
                  </div>
                  {product.compareAtCents && (
                    <div className="text-xs text-slate-400 line-through">
                      {formatMoney(product.compareAtCents)}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => addToCart(product.slug)}
                  className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#2E6F40] transition-all cursor-pointer"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>
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
