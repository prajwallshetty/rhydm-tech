"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Bookmark,
  ShoppingCart,
  Users,
  Recycle,
  FileText,
  Image as ImageIcon,
  Globe,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  X,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { logoutAdminAction } from "@/app/admin/actions";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Brands", href: "/admin/brands", icon: Bookmark },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Disposal CMS", href: "/admin/disposal", icon: Recycle },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "Media", href: "/admin/media", icon: ImageIcon },
  { name: "SEO", href: "/admin/seo", icon: Globe },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <div className="flex h-full flex-col justify-between bg-card text-card-foreground border-r border-border/80">
      <div>
        {/* Brand logo & header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border/60">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-foreground text-base">Rhydm</span>
              <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">Admin</span>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer logout */}
      <div className="p-4 border-t border-border/60">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 z-40 md:hidden flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl"
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col shrink-0 sticky top-0 h-screen">
        {navContent}
      </aside>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
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
