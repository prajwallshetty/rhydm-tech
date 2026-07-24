"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/store/product-card";
import { cn } from "@/lib/utils";

export function HomeRefurbishedSections({
  categories,
  featuredProducts,
  bestSellers,
  brands,
  testimonials = [],
}: {
  categories: any[];
  featuredProducts: any[];
  bestSellers: any[];
  brands: any[];
  testimonials?: Array<{
    id: string;
    quote: string;
    author: string;
    role: string | null;
    company: string | null;
    rating: number | null;
    avatarUrl: string | null;
  }>;
}) {
  const t = useTranslations("store.home");

  // Category Image Mapping
  const getCategoryImage = (slug: string) => {
    switch (slug) {
      case "laptops":
        return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&q=80";
      case "desktops":
        return "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop&q=80";
      case "servers":
        return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=300&fit=crop&q=80";
      case "networking":
        return "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=300&fit=crop&q=80";
      case "storage":
        return "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop&q=80";
      case "accessories":
        return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&q=80";
      case "monitors":
        return "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop&q=80";
      default:
        return "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=300&h=300&fit=crop&q=80";
    }
  };

  return (
    <div className="space-y-24 bg-white text-slate-900 py-16">
      {/* 1. Shop by Category (Circular Top Collections style) */}
      <section className="mx-auto max-w-7xl px-6 text-center">
        <div className="space-y-3 max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t("collectionsTitle")}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-normal">
            {t("collectionsSubtitle")}
          </p>
        </div>

        {/* Responsive grid displaying all circles fully without horizontal scrolling */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 justify-items-center py-6">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center shrink-0 snap-center group"
            >
              <Link
                href={`/refurbished/categories/${cat.slug}`}
                className="flex flex-col items-center gap-4"
              >
                {/* Perfect Circular Crop Container */}
                <div className="relative size-28 sm:size-32 lg:size-36 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shadow-md transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg group-hover:border-[#2E6F40]/30">
                  <img
                    src={cat.thumbnailUrl || cat.imageUrl || getCategoryImage(cat.slug)}
                    alt=""
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Subtle inner overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Bold Centered Typography */}
                <span className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#2E6F40] transition-colors tracking-tight">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. Featured Products */}

      {/* 3. Featured Products */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E6F40]">{t("featuredEyebrow")}</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mt-1">
              {t("featuredTitle")}
            </h2>
          </div>
          <Link
            href="/refurbished/shop"
            className="flex min-h-11 items-center gap-1.5 py-2 -my-2 text-xs font-bold text-[#2E6F40] hover:brightness-125 transition-colors"
          >
            <span>{t("viewAllProducts")}</span>
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

      {/* 4. Customer Say! (Testimonials Section) */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="space-y-3 max-w-2xl mx-auto mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t("testimonialsTitle")}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-normal">
            {t("testimonialsSubtitle")}
          </p>
        </div>

        {testimonials.length > 0 ? (
          /* CMS-driven testimonials (Testimonials CMS, division = Refurbished) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {testimonials.map((tm, i) => {
              const hasSideImage = !!tm.avatarUrl;
              return (
                <motion.div
                  key={tm.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:border-[#2E6F40]/30 hover:shadow-xl hover:shadow-slate-200/40",
                    hasSideImage ? "sm:flex-row" : ""
                  )}
                >
                  {/* Left Image Section */}
                  {hasSideImage && (
                    <div className="w-full sm:w-[42%] shrink-0 relative min-h-[220px] sm:min-h-auto">
                      <img
                        src={tm.avatarUrl!}
                        alt={tm.author}
                        className="absolute inset-0 size-full object-cover"
                      />
                    </div>
                  )}

                  {/* Review Section */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      {/* Stars */}
                      <div className="flex text-amber-500 gap-0.5 mb-2">
                        {"★".repeat(tm.rating ?? 5)}
                      </div>
                      {/* Author Name */}
                      <div className="text-sm font-bold text-slate-900">
                        {tm.author}
                        {tm.role && (
                          <span className="text-xs font-normal text-slate-400 ml-1.5 italic">
                            ✓ {tm.role}
                          </span>
                        )}
                      </div>
                      {/* Review Text */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mt-3">
                        “{tm.quote}”
                      </p>
                    </div>

                    {/* Product Badge if company field is used as product info */}
                    {tm.company && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
                          <div className="flex size-10 items-center justify-center rounded-full bg-white border border-slate-200/80 text-[#2E6F40] shadow-3xs shrink-0 font-bold text-xs">
                            {tm.company.toLowerCase().includes("workstation") || tm.company.toLowerCase().includes("desktop") ? "🖥️" : "💻"}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {tm.company.split(" - ")[0]}
                            </h4>
                            {tm.company.includes(" - ") && (
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                {tm.company.split(" - ")[1]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Testimonial Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:border-[#2E6F40]/30 hover:shadow-xl hover:shadow-slate-200/40"
          >
            {/* Left Image Section */}
            <div className="w-full sm:w-[42%] shrink-0 relative min-h-[220px] sm:min-h-auto">
              <img
                src="/workspace_setup.png"
                alt={t("reviewAlt1")}
                className="absolute inset-0 size-full object-cover"
              />
            </div>

            {/* Right Review Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                {/* 5 Stars */}
                <div className="flex text-amber-500 gap-0.5 mb-2">
                  {"★".repeat(5)}
                </div>
                {/* Author Name */}
                <div className="text-sm font-bold text-slate-900">
                  Sarah Jenkins <span className="text-xs font-normal text-slate-400 ml-1.5 italic">✓ {t("verifiedBuyer")}</span>
                </div>
                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mt-3">
                  {t("review1")}
                </p>
              </div>

              {/* Separation Line & Product Badge */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white border border-slate-200/80 text-[#2E6F40] shadow-3xs shrink-0 font-bold text-xs">
                    💻
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Apple MacBook Pro 14 M3</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">1.499,00 €</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:border-[#2E6F40]/30 hover:shadow-xl hover:shadow-slate-200/40"
          >
            {/* Left Image Section */}
            <div className="w-full sm:w-[42%] shrink-0 relative min-h-[220px] sm:min-h-auto">
              <img
                src="/developer_setup.png"
                alt={t("reviewAlt2")}
                className="absolute inset-0 size-full object-cover"
              />
            </div>

            {/* Right Review Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                {/* 5 Stars */}
                <div className="flex text-amber-500 gap-0.5 mb-2">
                  {"★".repeat(5)}
                </div>
                {/* Author Name */}
                <div className="text-sm font-bold text-slate-900">
                  David Miller <span className="text-xs font-normal text-slate-400 ml-1.5 italic">✓ {t("verifiedBuyer")}</span>
                </div>
                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mt-3">
                  {t("review2")}
                </p>
              </div>

              {/* Separation Line & Product Badge */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white border border-slate-200/80 text-[#2E6F40] shadow-3xs shrink-0 font-bold text-xs">
                    🖥️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Dell Latitude 7440 Workstation</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">749,00 €</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </section>

      {/* 5. Newsletter Section */}
      <section className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ backgroundColor: "#2E6F40" }}
          className="rounded-[40px] p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {t("newsletterTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              {t("newsletterSubtitle")}
            </p>

            <form action="/refurbished" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
              <input
                type="email"
                required
                placeholder={t("emailPlaceholder")}
                className="flex-1 rounded-full border border-white/30 bg-white/10 px-5 py-3.5 text-xs text-white placeholder:text-white/60 outline-none backdrop-blur-md focus:border-white"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-7 py-3.5 text-xs font-bold text-slate-900 shadow-xl hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {t("subscribe")}
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
