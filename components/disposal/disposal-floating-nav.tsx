"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { Search, User, ArrowUpRight, Menu, X, PhoneCall, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/brand/logo";

export function DisposalFloatingNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const navLinks = [
    { label: "Services", href: "/disposal/services" },
    { label: "Process", href: "/disposal/process" },
    { label: "Industries", href: "/disposal/industries" },
    { label: "Certificates", href: "/disposal/certificates" },
    { label: "FAQs", href: "/disposal/faqs" },
    { label: "Contact", href: "/disposal/contact" },
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
          {/* Logo without shield icon */}
          <Link href="/disposal" className="flex items-center gap-3 shrink-0 group">
            <Logo showShield={false} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/disposal" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-muted text-foreground font-bold"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & CTA Button */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              aria-label="Search disposal services"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Quick Contact Icon */}
            <Link
              href="/disposal/contact"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
              aria-label="Contact Us"
            >
              <PhoneCall className="h-4 w-4" />
            </Link>

            {/* User Account */}
            <Link
              href="/refurbished/account"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-all"
              aria-label="Account"
            >
              <User className="h-4 w-4" />
            </Link>

            {/* Shop Refurbished CTA Button */}
            <Link
              href="/refurbished"
              style={{ backgroundColor: "#2E6F40" }}
              className="hidden sm:flex items-center gap-1 rounded-full text-white px-4 py-2 text-xs font-semibold shadow-md shadow-[#2E6F40]/20 transition-all hover:brightness-110 hover:scale-105 active:scale-95"
            >
              <span>Shop Refurbished</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-foreground lg:hidden cursor-pointer"
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
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search IT asset disposal services, data wiping, e-waste recycling..."
                  className="w-full rounded-xl border border-border/70 bg-background/50 pl-10 pr-10 py-2.5 text-xs font-medium text-foreground outline-none focus:border-[#2E6F40]"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              {searchQuery.trim() && (
                <div className="mt-3 pt-3 border-t border-border/60 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2">
                    Suggested Services:
                  </div>
                  {[
                    { title: "Secure Data Wiping & Sanitization", href: "/disposal/services/secure-data-wiping" },
                    { title: "On-Site Hard Drive Shredding", href: "/disposal/services/hard-drive-destruction" },
                    { title: "Enterprise IT Asset Disposal", href: "/disposal/services/it-asset-disposal" },
                    { title: "Compliance & Audit Certificates", href: "/disposal/certificates" },
                  ]
                    .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <span>{item.title}</span>
                        <ArrowUpRight className="size-3 text-muted-foreground" />
                      </Link>
                    ))}
                </div>
              )}
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
                  href="/refurbished"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ backgroundColor: "#2E6F40" }}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md"
                >
                  <span>Shop Refurbished Hardware</span>
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
