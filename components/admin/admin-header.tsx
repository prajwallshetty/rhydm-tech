"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Menu,
  User,
  ShoppingCart,
  Star,
  Mail,
  Boxes,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAdminUi } from "@/lib/store/admin-ui";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "order" | "review" | "inquiry" | "stock";
  title: string;
  detail: string;
  href: string;
  tone: "info" | "warning" | "success";
  count: number;
};

const NOTIF_ICON: Record<Notification["type"], React.ElementType> = {
  order: ShoppingCart,
  review: Star,
  inquiry: Mail,
  stock: Boxes,
};

const TONE_STYLE: Record<Notification["tone"], string> = {
  info: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
};

export function AdminHeader({
  adminUser,
  notifications = { items: [], total: 0 },
}: {
  adminUser: { name?: string | null; email: string };
  notifications?: { items: Notification[]; total: number };
}) {
  const setMobileOpen = useAdminUi((s) => s.setMobileOpen);
  const toggleCollapsed = useAdminUi((s) => s.toggleCollapsed);

  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!bellRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const badge = notifications.total > 99 ? "99+" : String(notifications.total);

  // One button, breakpoint-aware: opens the drawer on mobile, toggles the
  // icon rail on desktop. Both paths now drive real shared state (previously
  // the handler was never passed in, so this button did nothing).
  const handleMenu = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches
    ) {
      toggleCollapsed();
    } else {
      setMobileOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 dark:bg-card/90 px-6 backdrop-blur-md">
      {/* Left Menu Toggle & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={handleMenu}
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="size-5" />
        </button>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 dark:border-border dark:bg-muted/40 pl-10 pr-12 py-2 text-xs font-medium outline-none focus:border-[#2E6F40] focus:bg-white dark:focus:bg-card transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white dark:border-border dark:bg-card px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification bell — badge and feed are real, actionable counts. */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative flex size-9 items-center justify-center rounded-full text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer"
            aria-label={`Notifications${notifications.total ? ` (${notifications.total})` : ""}`}
            aria-expanded={open}
          >
            <Bell className="size-4.5" />
            {notifications.total > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-xs">
                {badge}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <span className="text-sm font-bold text-foreground">Notifications</span>
                {notifications.total > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {notifications.total} pending
                  </span>
                )}
              </div>

              {notifications.items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="mx-auto size-7 text-muted-foreground/40" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    You&rsquo;re all caught up.
                  </p>
                </div>
              ) : (
                <ul className="max-h-96 divide-y divide-border/60 overflow-y-auto">
                  {notifications.items.map((n) => {
                    const Icon = NOTIF_ICON[n.type];
                    return (
                      <li key={n.id}>
                        <Link
                          href={n.href}
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                        >
                          <span
                            className={cn(
                              "grid size-8 shrink-0 place-items-center rounded-lg",
                              TONE_STYLE[n.tone],
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-xs font-bold text-foreground">
                              {n.title}
                            </span>
                            <span className="block text-[11px] text-muted-foreground">
                              {n.detail}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-border pl-3 ml-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs shadow-sm">
            <User className="size-4" />
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {adminUser.name || "Admin"}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">
              {adminUser.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
