"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Search, ChevronRight, Laptop, Server, Smartphone, Cpu, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type BrandItem = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  _count: {
    products: number;
  };
};

const BRAND_ICONS: Record<string, any> = {
  apple: Smartphone,
  dell: Laptop,
  hp: Laptop,
  lenovo: Laptop,
  cisco: Server,
  intel: Cpu,
};

// Distinct gradients for brands to make them feel rich and custom
const BRAND_GRADIENTS: Record<string, string> = {
  apple: "from-slate-800 to-slate-900 text-white",
  dell: "from-blue-600 to-indigo-700 text-white",
  hp: "from-sky-500 to-blue-600 text-white",
  lenovo: "from-red-500 to-rose-600 text-white",
  cisco: "from-cyan-500 to-teal-600 text-white",
  intel: "from-blue-500 to-sky-600 text-white",
};

export function BrandsClient({
  brands,
  searchPlaceholder,
  noResultsText,
  productCountText,
}: {
  brands: BrandItem[];
  searchPlaceholder: string;
  noResultsText: string;
  productCountText: string;
}) {
  const [query, setQuery] = useState("");

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Premium Search Filter Header */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium outline-none shadow-xs transition-all focus:border-[#2E6F40] focus:ring-2 focus:ring-[#2E6F40]/15"
        />
      </div>

      {/* Grid Display */}
      <AnimatePresence mode="popLayout">
        {filteredBrands.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-12 text-slate-400 font-medium text-sm"
          >
            {noResultsText}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredBrands.map((brand, i) => {
              const Icon = BRAND_ICONS[brand.slug.toLowerCase()] || Laptop;
              const gradient =
                BRAND_GRADIENTS[brand.slug.toLowerCase()] || "from-emerald-500 to-teal-600 text-white";

              return (
                <motion.div
                  key={brand.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/refurbished/brands/${brand.slug}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:border-[#2E6F40]/30 hover:shadow-xl hover:shadow-[#2E6F40]/5"
                  >
                    {/* Background Grid Pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, #2E6F40 1px, transparent 1px), linear-gradient(to bottom, #2E6F40 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }}
                    />

                    <div className="space-y-4 relative z-10">
                      {/* Top icon and badge */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`size-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
                        >
                          <Icon className="size-6 stroke-[1.8]" />
                        </div>
                        <span className="text-[10px] font-black text-[#2E6F40] bg-[#2E6F40]/10 border border-[#2E6F40]/10 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                          Verified
                        </span>
                      </div>

                      {/* Brand Info */}
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#2E6F40] transition-colors tracking-tight">
                          {brand.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 font-bold">
                          {brand._count.products} Refurbished Units
                        </p>
                      </div>
                    </div>

                    {/* Footer Arrow link */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                      <span className="text-xs font-extrabold text-[#2E6F40] inline-flex items-center gap-1">
                        Browse Brand
                        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
