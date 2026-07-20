"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, User as UserIcon, Shield, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AdminHeader({ adminUser }: { adminUser: { name?: string | null; email: string } }) {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return [{ label: "Dashboard", href: "/admin" }];

    const items = [{ label: "Admin", href: "/admin" }];
    let currentPath = "/admin";

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      currentPath += `/${seg}`;
      const label = seg.charAt(0).toUpperCase() + seg.slice(1);
      items.push({ label, href: currentPath });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-card/80 px-6 backdrop-blur-md">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
              {isLast ? (
                <span className="font-semibold text-foreground">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Quick view public sites */}
        <div className="hidden sm:flex items-center gap-2 border-r border-border/60 pr-4 text-xs font-medium text-muted-foreground">
          <Link
            href="/disposal"
            target="_blank"
            className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-muted hover:text-foreground transition-colors"
          >
            <span>Disposal Site</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            href="/refurbished"
            target="_blank"
            className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-muted hover:text-foreground transition-colors"
          >
            <span>Store</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <ThemeToggle />

        {/* User Badge */}
        <div className="flex items-center gap-2.5 rounded-full border border-border/80 bg-background px-3 py-1.5 text-xs font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-foreground">{adminUser.name || adminUser.email}</span>
          <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Shield className="h-2.5 w-2.5" />
            ADMIN
          </span>
        </div>
      </div>
    </header>
  );
}
