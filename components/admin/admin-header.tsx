"use client";

import { Search, Bell, MessageSquare, Menu, User } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AdminHeader({
  adminUser,
  onMenuToggle,
}: {
  adminUser: { name?: string | null; email: string };
  onMenuToggle?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 dark:bg-card/90 px-6 backdrop-blur-md">
      {/* Left Menu Toggle & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onMenuToggle}
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
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

        {/* Notification Bell with Badge */}
        <button
          className="relative flex size-9 items-center justify-center rounded-full text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-xs">
            8
          </span>
        </button>

        {/* Message Bubble Icon */}
        <button
          className="flex size-9 items-center justify-center rounded-full text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer"
          aria-label="Messages"
        >
          <MessageSquare className="size-4.5" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-border pl-3 ml-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs shadow-sm">
            <User className="size-4" />
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {adminUser.name || "Admin"}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
