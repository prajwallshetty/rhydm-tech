"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, ShoppingCart, User, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SearchBox } from "@/components/store/search-box";
import { SwitchBusiness } from "@/components/layout/switch-business";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cartCount, useStore } from "@/lib/store/cart";
import { ACCOUNT_NAV, NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function StoreHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);

  const items = NAV.refurbished;
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center gap-4">
          <Link href="/refurbished" className="shrink-0 rounded-md">
            <Logo />
            <span className="sr-only">Refurbished store home</span>
          </Link>

          <SearchBox className="hidden flex-1 md:block md:max-w-md" />

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/refurbished/wishlist"
              aria-label={`Wishlist, ${wishlist.length} items`}
              className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Heart className="size-4.5" strokeWidth={1.8} />
              <Badge count={wishlist.length} />
            </Link>

            <Link
              href="/refurbished/cart"
              aria-label={`Cart, ${cartCount(cart)} items`}
              className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ShoppingCart className="size-4.5" strokeWidth={1.8} />
              <Badge count={cartCount(cart)} />
            </Link>

            <Link
              href="/refurbished/account"
              aria-label="Account"
              className="hidden size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:grid"
            >
              <User className="size-4.5" strokeWidth={1.8} />
            </Link>

            <ThemeToggle />

            <Link
              href="/disposal"
              className="ml-1 hidden rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 lg:inline-block"
            >
              Dispose Assets
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="store-mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="grid size-9 place-items-center rounded-lg border border-border/70 text-muted-foreground lg:hidden"
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Category row, desktop only. */}
        <nav aria-label="Shop categories" className="hidden lg:block">
          <ul className="flex items-center gap-1 pb-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm transition-colors",
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="ml-auto">
              <SwitchBusiness />
            </li>
          </ul>
        </nav>
      </div>

      {/* Search is hidden above on small screens — surface it here instead. */}
      <div className="border-t border-border/70 px-6 py-2.5 md:hidden">
        <SearchBox />
      </div>

      {menuOpen && (
        <nav
          id="store-mobile-nav"
          aria-label="Store mobile"
          className="border-t border-border/70 bg-background lg:hidden"
        >
          <ul className="mx-auto max-w-7xl px-6 py-3">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="mt-2 border-t border-border/70 pt-2">
              <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Account
              </p>
            </li>
            {ACCOUNT_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="mt-2 border-t border-border/70 pt-2">
              <Link
                href="/disposal"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-brand"
              >
                Dispose Assets
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

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      aria-hidden
      className="absolute -right-0.5 -top-0.5 grid min-w-4.5 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-4 text-brand-foreground"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
