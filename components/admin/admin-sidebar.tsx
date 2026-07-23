"use client";

import { useState } from "react";
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
  FileText,
  UserCheck,
  Shield,
  Settings,
  LogOut,
  MoreVertical,
  X,
  Menu,
} from "lucide-react";
import { logoutAdminAction } from "@/app/(backend)/(admin)/admin/actions";
import { cn } from "@/lib/utils";

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
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "M.A.I.N",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Reviews", href: "/admin/products", icon: Star },
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
      { name: "Inventory", href: "/admin/products", icon: Boxes },
      { name: "Deals", href: "/admin/deals", icon: Percent },
      { name: "Site Content", href: "/admin/content", icon: LayoutTemplate },
      { name: "Coupons", href: "/admin/settings", icon: Tag },
      { name: "Banners", href: "/admin/disposal", icon: ImageIcon },
      { name: "Blog", href: "/admin/blogs", icon: FileText },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Users", href: "/admin/users", icon: UserCheck },
      { name: "Roles & Permissions", href: "/admin/settings", icon: Shield },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white text-slate-800 dark:bg-card dark:text-card-foreground border-r border-slate-200/80 dark:border-border shadow-xs">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-border/60">
          <Link href="/admin" className="flex items-center gap-3 group">
            {/* Green Leaf / Logo Icon */}
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#2E6F40] text-white shadow-md shadow-[#2E6F40]/25 transition-transform group-hover:scale-105">
              <svg className="size-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg">RENEWED</span>
              <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">Smarter Tech. Cleaner Tomorrow.</p>
            </div>
          </Link>

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
              {group.title && (
                <h3 className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-muted-foreground uppercase mb-1.5">
                  {group.title}
                </h3>
              )}
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all",
                      active
                        ? "bg-[#2E6F40]/10 text-[#2E6F40] dark:bg-[#2E6F40]/20 dark:text-emerald-400 font-extrabold"
                        : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-muted dark:hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active ? "text-[#2E6F40] dark:text-emerald-400" : "text-slate-400 dark:text-muted-foreground")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Profile Pill Widget */}
      <div className="p-4 border-t border-slate-100 dark:border-border/60 relative">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-muted/40 p-3 border border-slate-100 dark:border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2E6F40]/15 text-[#2E6F40] font-bold text-xs">
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              A
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">Admin</h4>
              <p className="text-[10px] text-slate-400 truncate">admin@renewed.com</p>
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
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 z-40 md:hidden flex size-12 items-center justify-center rounded-full bg-[#2E6F40] text-white shadow-xl shadow-[#2E6F40]/30 cursor-pointer"
        aria-label="Open sidebar"
      >
        <Menu className="size-6" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col shrink-0 sticky top-0 h-screen">
        {navContent}
      </aside>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
