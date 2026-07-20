"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SwitchBusiness } from "@/components/layout/switch-business";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DIVISION_META, type Division } from "@/lib/business";
import { NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader({ division }: { division: Division }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = NAV[division];
  const meta = DIVISION_META[division];
  const other =
    DIVISION_META[division === "disposal" ? "refurbished" : "disposal"];

  const isActive = (href: string) =>
    href === meta.href ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link href={meta.href} className="shrink-0 rounded-md">
          <Logo />
          <span className="sr-only">{meta.name} home</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
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
            className="grid size-9 place-items-center rounded-lg border border-border/70 text-muted-foreground lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary mobile"
          className="border-t border-border/70 bg-background lg:hidden"
        >
          <ul className="mx-auto max-w-7xl px-6 py-3">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-border/70 pt-2">
              <Link
                href={other.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-brand"
              >
                {meta.crossLinkLabel}
              </Link>
            </li>
            <li>
              <SwitchBusiness className="w-full justify-start px-3 py-2.5" />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
