"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { Search, Heart, ShoppingBag, User, ArrowUpRight, Menu, X } from "lucide-react";

import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cartCount, useStore } from "@/lib/store/cart";
import { SearchBox } from "@/components/store/search-box";

export function FloatingNav() {
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
    { label: t("support"), href: "/refurbished/support" },
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
          className={`flex items-center justify-between rounded-full px-5 py-4 transition-all duration-500 border shadow-lg ${
            scrolled
              ? "bg-white/95 dark:bg-card/95 border-border/80 shadow-black/10 backdrop-blur-2xl py-3"
              : "bg-white/80 dark:bg-card/80 border-white/40 dark:border-border/40 shadow-black/5 backdrop-blur-xl"
          }`}
        >
          {/* Logo without shield icon or premium tag */}
          <Link href="/refurbished" className="flex items-center gap-3 shrink-0 group py-2 -my-2">
            <Logo showShield={false} className="h-9 sm:h-14 lg:h-16" />
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
              className="relative hidden md:flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              aria-label={t("wishlist")}
            >
              <Heart className="h-4 w-4" />
              <AnimatePresence mode="popLayout">
                {wishlist.length > 0 && (
                  <motion.span
                    key={wishlist.length}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Cart Icon with Badge */}
            <Link
              href="/refurbished/cart"
              className="relative flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              aria-label={t("cart")}
            >
              <ShoppingBag className="h-4 w-4" />
              <AnimatePresence mode="popLayout">
                {cartCount(cart) > 0 && (
                  <motion.span
                    key={cartCount(cart)}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    style={{ backgroundColor: "#2E6F40" }}
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm"
                  >
                    {cartCount(cart)}
                  </motion.span>
                )}
              </AnimatePresence>
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

            <LanguageSwitcher className="hidden lg:block" />

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
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 flex h-full w-[85%] max-w-sm flex-col justify-between border-l border-border/80 bg-card p-6 shadow-2xl overflow-y-auto"
            >
              <div>
                {/* Header inside drawer */}
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <Logo showShield={false} />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="grid size-9 place-items-center rounded-full border border-border text-foreground hover:bg-muted cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Quick Access Bar: Search, Wishlist, Cart, Account */}
                <div className="mt-4 flex items-center justify-around rounded-2xl border border-border/60 bg-muted/40 p-2.5">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="flex flex-col items-center gap-1 text-xs font-semibold text-foreground/80 hover:text-foreground cursor-pointer"
                  >
                    <div className="grid size-9 place-items-center rounded-full bg-background border border-border/50">
                      <Search className="size-4" />
                    </div>
                    <span>Search</span>
                  </button>

                  <Link
                    href="/refurbished/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative flex flex-col items-center gap-1 text-xs font-semibold text-foreground/80 hover:text-foreground"
                  >
                    <div className="grid size-9 place-items-center rounded-full bg-background border border-border/50">
                      <Heart className="size-4" />
                      <AnimatePresence mode="popLayout">
                        {wishlist.length > 0 && (
                          <motion.span
                            key={wishlist.length}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                          >
                            {wishlist.length}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <span>Wishlist</span>
                  </Link>

                  <Link
                    href="/refurbished/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative flex flex-col items-center gap-1 text-xs font-semibold text-foreground/80 hover:text-foreground"
                  >
                    <div className="grid size-9 place-items-center rounded-full bg-background border border-border/50">
                      <ShoppingBag className="size-4" />
                      <AnimatePresence mode="popLayout">
                        {cartCount(cart) > 0 && (
                          <motion.span
                            key={cartCount(cart)}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#2E6F40] text-[9px] font-bold text-white"
                          >
                            {cartCount(cart)}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <span>Cart</span>
                  </Link>

                  <Link
                    href="/refurbished/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-1 text-xs font-semibold text-foreground/80 hover:text-foreground"
                  >
                    <div className="grid size-9 place-items-center rounded-full bg-background border border-border/50">
                      <User className="size-4" />
                    </div>
                    <span>Account</span>
                  </Link>
                </div>

                {/* Nav Links */}
                <nav className="mt-6 flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Drawer Footer Actions */}
              <div className="mt-8 space-y-4 border-t border-border/60 pt-6">
                <Link
                  href="/disposal"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ backgroundColor: "#2E6F40" }}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all"
                >
                  <span>{t("disposeAssets")}</span>
                  <ArrowUpRight className="size-4" />
                </Link>

                <div className="flex items-center justify-between px-2 pt-2">
                  <span className="text-xs text-muted-foreground font-medium">Language</span>
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
