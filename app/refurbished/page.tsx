import { HeroRefurbishedMotion } from "@/components/store/hero-refurbished-motion";
import { HomeRefurbishedSections } from "@/components/store/home-refurbished-sections";
import {
  getBestSellers,
  getBrands,
  getCategories,
  getFeaturedProducts,
} from "@/lib/repositories/store";

export default async function RefurbishedHomePage() {
  const [featured, bestSellers, categories, brands] = await Promise.all([
    getFeaturedProducts(8),
    getBestSellers(8),
    getCategories(),
    getBrands(),
  ]);

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      {/* 1. Full-Viewport Hero with Mouse Parallax & Scroll Animations */}
      <HeroRefurbishedMotion />

      {/* 2. Apple/Ather-style Home Sections */}
      <HomeRefurbishedSections
        categories={categories}
        featuredProducts={featured}
        bestSellers={bestSellers}
        brands={brands}
      />
    </div>
  );
}
