"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Star,
  Layers,
  Bookmark,
  Boxes,
  Percent,
  LayoutTemplate,
  Tag,
  Image as ImageIcon,
  MessageSquareQuote,
  FileText,
  UserCheck,
  Settings,
  LogOut,
  MoreVertical,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { logoutAdminAction } from "@/app/(backend)/(admin)/admin/actions";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { useAdminUi } from "@/lib/store/admin-ui";

type NavGroup = {
  title?: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ElementType;
  }>;
};

const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "M.A.I.N",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "CATALOG",
    items: [
      { name: "Categories", href: "/admin/categories", icon: Layers },
      { name: "Brands", href: "/admin/brands", icon: Bookmark },
    ],
  },
  {
    title: "STORE",
    items: [
      { name: "Inventory", href: "/admin/inventory", icon: Boxes },
      { name: "Deals", href: "/admin/deals", icon: Percent },
      { name: "Coupons", href: "/admin/coupons", icon: Tag },
      { name: "Site Content", href: "/admin/content", icon: LayoutTemplate },
      { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
      { name: "Disposal CMS", href: "/admin/disposal", icon: ImageIcon },
      { name: "Blog", href: "/admin/blogs", icon: FileText },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Users", href: "/admin/users", icon: UserCheck },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({
  admin,
}: {
  admin?: { name?: string | null; email: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Collapse/drawer state is shared with the header (see lib/store/admin-ui).
  const collapsed = useAdminUi((s) => s.collapsed);
  const mobileOpen = useAdminUi((s) => s.mobileOpen);
  const toggleCollapsed = useAdminUi((s) => s.toggleCollapsed);
  const setMobileOpen = useAdminUi((s) => s.setMobileOpen);

  // The persisted `collapsed` value only exists client-side; gate the visual
  // on mount so SSR and first paint always agree (expanded) — no hydration
  // mismatch, the width just settles after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isCollapsed = mounted && collapsed;

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const adminName = admin?.name || "Admin";
  const adminEmail = admin?.email || "";
  const initial = (adminName[0] || "A").toUpperCase();

  const renderNav = (collapsedView: boolean) => (
    <div className="flex h-full flex-col justify-between bg-white text-slate-800 dark:bg-card dark:text-card-foreground border-r border-slate-200/80 dark:border-border shadow-xs">
      <div>
        {/* Brand Header */}
        <div
          className={cn(
            "flex items-center border-b border-slate-100 dark:border-border/60 py-5",
            collapsedView ? "flex-col gap-3 px-3" : "justify-between px-6",
          )}
        >
          <Link
            href="/admin"
            className="inline-block group transition-transform hover:scale-105"
            aria-label="Dashboard"
          >
            <Logo className={cn("w-auto", collapsedView ? "h-8" : "h-10")} markOnly={collapsedView} />
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapsed}
            className="hidden md:inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-muted transition-colors cursor-pointer"
            aria-label={collapsedView ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsedView ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsedView ? (
              <PanelLeftOpen className="size-4.5" />
            ) : (
              <PanelLeftClose className="size-4.5" />
            )}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Grouped Navigation List */}
        <nav className="px-3 py-4 space-y-5 overflow-y-auto max-h-[calc(100vh-13rem)] scrollbar-thin">
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.title && !collapsedView && (
                <h3 className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-muted-foreground uppercase mb-1.5">
                  {group.title}
                </h3>
              )}
              {group.title && collapsedView && groupIdx > 0 && (
                <div className="mx-3 mb-1.5 border-t border-slate-100 dark:border-border/60" />
              )}
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    title={collapsedView ? item.name : undefined}
                    aria-label={item.name}
                    className={cn(
                      "flex items-center rounded-xl text-xs font-bold transition-all",
                      collapsedView
                        ? "justify-center px-0 py-2.5"
                        : "gap-3 px-3.5 py-2.5",
                      active
                        ? "bg-[#2E6F40]/10 text-[#2E6F40] dark:bg-[#2E6F40]/20 dark:text-emerald-400 font-extrabold"
                        : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-muted dark:hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        active
                          ? "text-[#2E6F40] dark:text-emerald-400"
                          : "text-slate-400 dark:text-muted-foreground",
                      )}
                    />
                    {!collapsedView && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Profile Pill Widget */}
      <div className="p-4 border-t border-slate-100 dark:border-border/60 relative">
        {collapsedView ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2E6F40]/15 text-[#2E6F40] font-bold text-xs"
              title={adminEmail}
            >
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              {initial}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-muted/40 p-3 border border-slate-100 dark:border-border">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2E6F40]/15 text-[#2E6F40] font-bold text-xs">
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                {initial}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {adminName}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">{adminEmail}</p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-muted transition-colors cursor-pointer"
                aria-label="Account options"
              >
                <MoreVertical className="size-4" />
              </button>

              {menuOpen && (
                <div className="absolute bottom-10 right-0 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-border dark:bg-card">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Logout Session</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — width animates between full and icon-only rail. */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 sticky top-0 h-screen transition-[width] duration-300 ease-in-out",
          isCollapsed ? "w-[76px]" : "w-64",
        )}
      >
        {renderNav(isCollapsed)}
      </aside>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {/* The drawer is always expanded, regardless of desktop collapse. */}
            {renderNav(false)}
          </div>
        </div>
      )}
    </>
  );
}
