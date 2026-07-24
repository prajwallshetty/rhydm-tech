"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { Search, User, ArrowUpRight, Menu, X, PhoneCall } from "lucide-react";

import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { COMPANY } from "@/lib/business";

export function DisposalFloatingNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const t = useTranslations("nav.disposal");
  const navLinks = [
    { label: t("services"), href: "/disposal/services" },
    { label: t("process"), href: "/disposal/process" },
    { label: t("industries"), href: "/disposal/industries" },
    { label: t("certificates"), href: "/disposal/certificates" },
    { label: t("faqs"), href: "/disposal/faqs" },
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
              ? "bg-white/95 border-slate-200 shadow-black/10 backdrop-blur-2xl py-2.5"
              : "bg-white/80 border-slate-200/50 shadow-black/5 backdrop-blur-xl"
          }`}
        >
          {/* Logo */}
          <Link href="/disposal" className="flex items-center gap-3 shrink-0 group py-2 -my-2">
            <Logo showShield={false} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/disposal" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-100 text-[#16A34A] font-bold"
                      : "text-slate-700 hover:text-[#16A34A] hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & CTA Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 border-r border-slate-200 pr-4 mr-2">
              <PhoneCall className="size-3.5 text-[#16A34A]" />
              <span>{COMPANY.phone}</span>
            </div>

            {/* Shop Refurbished CTA Button */}
            <Link
              href="/refurbished"
              className="inline-flex items-center gap-1 rounded-full bg-[#16A34A] text-white px-4 py-2 text-xs font-semibold shadow-md shadow-[#16A34A]/25 transition-all hover:bg-[#15803D] hover:scale-105 active:scale-95"
            >
              <span>{t("shopLink")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <LanguageSwitcher />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
              className="flex h-11 w-11 shrink-0 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-20 z-40 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl lg:hidden"
          >
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-[#16A34A]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href="/refurbished"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-[#16A34A] px-4 py-3 text-sm font-bold text-white shadow-md"
                >
                  <span>{t("shopLink")}</span>
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
