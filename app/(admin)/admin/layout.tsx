import { getAdminSession } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getAdminSession();

  // If not logged in as admin (e.g. on /admin/login page), render raw children
  if (!adminUser) {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground" data-division="admin">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader adminUser={adminUser} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
