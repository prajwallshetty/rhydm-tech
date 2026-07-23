"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { Search, Heart, ShoppingBag, User, ArrowUpRight, Menu, X, ChevronDown, Sparkles } from "lucide-react";

import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cartCount, useStore } from "@/lib/store/cart";
import { SearchBox } from "@/components/store/search-box";

export function FloatingNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);

  const { scrollY } = useScroll();
  const navScale = useTransform(scrollY, [0, 100], [1, 0.98]);
  const navY = useTransform(scrollY, [0, 100], [0, -4]);
  const smoothScale = useSpring(navScale, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(navY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const t = useTranslations("nav.store");
  const navLinks = [
    { label: t("shop"), href: "/refurbished/shop" },
    { label: t("categories"), href: "/refurbished/categories" },
    { label: t("brands"), href: "/refurbished/brands" },
    { label: t("deals"), href: "/refurbished/deals" },
    { label: t("support"), href: "/disposal/faqs" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.1 }}
        style={{ scale: smoothScale, y: smoothY }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-7xl"
      >
        <div
          className={`flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500 border shadow-lg ${
            scrolled
              ? "bg-white/95 dark:bg-card/95 border-border/80 shadow-black/10 backdrop-blur-2xl py-2.5"
              : "bg-white/80 dark:bg-card/80 border-white/40 dark:border-border/40 shadow-black/5 backdrop-blur-xl"
          }`}
        >
          {/* Logo without shield icon or premium tag */}
          <Link href="/refurbished" className="flex items-center gap-3 shrink-0 group py-2 -my-2">
            <Logo showShield={false} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full px-4 py-2 text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Dispose Button */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              aria-label={t("search")}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Wishlist Icon with Badge */}
            <Link
              href="/refurbished/wishlist"
              className="relative flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
              aria-label={t("wishlist")}
            >
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon with Badge */}
            <Link
              href="/refurbished/cart"
              className="relative flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
              aria-label={t("cart")}
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount(cart) > 0 && (
                <span
                  style={{ backgroundColor: "#2E6F40" }}
                  className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm"
                >
                  {cartCount(cart)}
                </span>
              )}
            </Link>

            {/* Account Profile */}
            <Link
              href="/refurbished/account"
              className="hidden sm:flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
              aria-label={t("account")}
            >
              <User className="h-4 w-4" />
            </Link>

            {/* Dispose Assets CTA Button */}
            <Link
              href="/disposal"
              style={{ backgroundColor: "#2E6F40" }}
              className="hidden sm:flex items-center gap-1 rounded-full text-white px-4 py-2 text-xs font-semibold shadow-md shadow-[#2E6F40]/20 transition-all hover:brightness-110 hover:scale-105 active:scale-95"
            >
              <span>{t("disposeAssets")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <LanguageSwitcher />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
              className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border/70 text-foreground lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Search Drawer Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur-2xl"
            >
              <SearchBox className="w-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-20 z-40 rounded-3xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-2xl lg:hidden"
          >
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border/60">
                <Link
                  href="/disposal"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ backgroundColor: "#2E6F40" }}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md"
                >
                  <span>{t("disposeAssets")}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
