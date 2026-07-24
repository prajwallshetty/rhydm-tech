import type { Metadata, Viewport } from "next";

import { getAdminSession } from "@/lib/auth/admin";
import { getAdminNotifications } from "@/lib/repositories/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AutoRefresh } from "@/components/admin/auto-refresh";
import { PwaProvider } from "@/components/admin/pwa-provider";
import { COMPANY } from "@/lib/business";

// PWA identity is scoped to /admin — public pages don't reference the
// manifest, so only the admin installs as the company admin app.
export const metadata: Metadata = {
  title: `${COMPANY.name} Admin`,
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: `${COMPANY.name} Admin`,
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/admin-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#16A34A",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getAdminSession();

  // If not logged in as admin (e.g. on /admin/login page), render raw children
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
        <PwaProvider />
      </div>
    );
  }

  // Re-fetched every 15s with the rest of the layout (see AutoRefresh).
  const notifications = await getAdminNotifications();

  return (
    <div className="flex min-h-screen bg-background text-foreground" data-division="admin">
      {/* Server Components re-run every 15s (paused in hidden tabs), so new
          orders and CMS edits appear without a manual reload. */}
      <AutoRefresh intervalMs={15_000} />
      <AdminSidebar admin={adminUser} />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader adminUser={adminUser} notifications={notifications} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
      <PwaProvider />
    </div>
  );
}
