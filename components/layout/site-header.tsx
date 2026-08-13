"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand/logo";
import { SwitchBusiness } from "@/components/layout/switch-business";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DIVISION_META, type Division } from "@/lib/business";
import { NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "motion/react";

export function SiteHeader({ division }: { division: Division }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations("common");

  const items = NAV[division];
  const meta = DIVISION_META[division];
  const other =
    DIVISION_META[division === "disposal" ? "refurbished" : "disposal"];

  const isActive = (href: string) =>
    href === meta.href ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6">
        <Link href={meta.href} className="shrink-0 rounded-md">
          <Logo />
          <span className="sr-only">{t("homeLink", { name: meta.name })}</span>
        </Link>

        <nav aria-label={t("primaryNav")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SwitchBusiness className="hidden md:inline-flex" />
          <ThemeToggle />

          {/* Cross-division link — the only nav item that leaves this site. */}
          <Link
            href={other.href}
            className="hidden items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {meta.crossLinkLabel}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-lg border border-border/70 text-muted-foreground lg:hidden cursor-pointer"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative z-10 flex h-full w-[85%] max-w-sm flex-col justify-between border-l border-border/80 bg-background p-6 shadow-2xl overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <Logo />
                  <button
                    onClick={() => setOpen(false)}
                    className="grid size-9 place-items-center rounded-lg border border-border/70 text-muted-foreground"
                    aria-label="Close menu"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <nav aria-label={t("primaryMobileNav")} className="mt-6">
                  <ul className="flex flex-col space-y-1">
                    {items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={isActive(item.href) ? "page" : undefined}
                          className={cn(
                            "block rounded-lg px-3.5 py-3 text-sm font-medium transition-colors",
                            isActive(item.href)
                              ? "bg-accent text-foreground font-bold"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <div className="mt-8 space-y-4 border-t border-border/70 pt-6">
                {division !== "disposal" && (
                  <Link
                    href={other.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg bg-brand px-4 py-3 text-sm font-medium text-brand-foreground shadow-sm"
                  >
                    <span>{meta.crossLinkLabel}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                )}

                <div className="pt-2">
                  <SwitchBusiness className="w-full justify-start px-3 py-2.5" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
