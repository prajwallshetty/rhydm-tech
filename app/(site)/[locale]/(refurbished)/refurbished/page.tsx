import { HeroRefurbishedMotion } from "@/components/store/hero-refurbished-motion";
import { setRequestLocale } from "next-intl/server";

import { getSectionContent } from "@/lib/cms/content";
import type { StoreHeroContent } from "@/lib/cms/registry";
import { HomeRefurbishedSections } from "@/components/store/home-refurbished-sections";
import {
  getBestSellers,
  getBrands,
  getCategories,
  getFeaturedProducts,
  getStoreTestimonials,
} from "@/lib/repositories/store";

export default async function RefurbishedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [featured, bestSellers, categories, brands, testimonials, heroContent] =
    await Promise.all([
      getFeaturedProducts(8),
      getBestSellers(8),
      getCategories(),
      getBrands(),
      getStoreTestimonials(),
      getSectionContent<StoreHeroContent>("section.refurbished.hero", locale),
    ]);

  return (
    // -mt-24 cancels the store layout's nav clearance on this page only: the
    // hero carries its own pt-28 and its tinted background is meant to extend
    // to the viewport top behind the floating nav — without this, a dead
    // white strip shows above the hero.
    <div className="-mt-24 bg-white text-slate-900 min-h-screen">
      {/* 1. Full-Viewport Hero with Mouse Parallax & Scroll Animations */}
      <HeroRefurbishedMotion content={heroContent} />

      {/* 2. Apple/Ather-style Home Sections */}
      <HomeRefurbishedSections
        categories={categories}
        featuredProducts={featured}
        bestSellers={bestSellers}
        brands={brands}
        testimonials={testimonials}
      />
    </div>
  );
}
