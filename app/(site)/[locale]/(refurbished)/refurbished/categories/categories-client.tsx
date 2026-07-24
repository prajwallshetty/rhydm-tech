"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Search, ChevronRight, Laptop, Server, Monitor, HardDrive, Cpu, Layers, Keyboard, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  _count?: {
    products: number;
  };
};

const CATEGORY_ICONS: Record<string, any> = {
  laptops: Laptop,
  desktops: Laptop,
  servers: Server,
  networking: Server,
  monitors: Monitor,
  storage: HardDrive,
  components: Cpu,
  accessories: Keyboard,
};

// Vibrant, cohesive color gradients for categories
const CATEGORY_GRADIENTS: Record<string, string> = {
  laptops: "from-[#2E6F40] to-emerald-600 text-white",
  desktops: "from-blue-600 to-indigo-700 text-white",
  servers: "from-indigo-600 to-purple-700 text-white",
  networking: "from-cyan-500 to-blue-600 text-white",
  monitors: "from-rose-500 to-pink-600 text-white",
  storage: "from-amber-500 to-orange-600 text-white",
  components: "from-violet-500 to-fuchsia-600 text-white",
  accessories: "from-slate-700 to-slate-800 text-white",
};

export function CategoriesClient({
  categories,
  searchPlaceholder,
  noResultsText,
}: {
  categories: CategoryItem[];
  searchPlaceholder: string;
  noResultsText: string;
}) {
  const [query, setQuery] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(query.toLowerCase())
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
        {filteredCategories.length === 0 ? (
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
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredCategories.map((category) => {
              const Icon = CATEGORY_ICONS[category.slug.toLowerCase()] || Layers;
              const gradient =
                CATEGORY_GRADIENTS[category.slug.toLowerCase()] || "from-emerald-500 to-teal-600 text-white";

              return (
                <motion.div
                  key={category.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/refurbished/categories/${category.slug}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:border-[#2E6F40]/30 hover:shadow-xl hover:shadow-[#2E6F40]/5 h-full"
                  >
                    {/* Header Image Area with Gradient & Icon */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-slate-100 bg-slate-50/50 flex items-center justify-center p-6">
                      <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, #2E6F40 1px, transparent 1px), linear-gradient(to bottom, #2E6F40 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />

                      {category.imageUrl || category.thumbnailUrl ? (
                        <img
                          src={category.thumbnailUrl || category.imageUrl || undefined}
                          alt={category.name}
                          className="absolute inset-6 size-[calc(100%-3rem)] rounded-2xl object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className={`size-20 rounded-[1.5rem] bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                        >
                          <Icon className="size-10 stroke-[1.8]" />
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="relative z-10 flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#2E6F40] transition-colors tracking-tight">
                          {category.name}
                        </h3>
                        <span className="text-[10px] font-black text-[#2E6F40] bg-[#2E6F40]/10 border border-[#2E6F40]/10 rounded-full px-2.5 py-0.5 uppercase tracking-wider shrink-0">
                          {category._count?.products ?? 0} items
                        </span>
                      </div>

                      <p className="mt-3 flex-1 text-xs leading-relaxed text-slate-500 font-medium">
                        {category.description || `Browse our collection of high quality refurbished ${category.name.toLowerCase()} sourced from corporate environments.`}
                      </p>

                      {/* Footer Link */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#2E6F40] inline-flex items-center gap-1">
                          Explore Category
                          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
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
