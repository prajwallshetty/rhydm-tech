import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { UsersTable } from "@/components/admin/users-table";
import { Role } from "@/lib/generated/prisma/enums";

export default async function AdminUsersPage() {
  const session = await getSession();
  const currentRole = session?.role || Role.CUSTOMER;

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          orders: true,
          auditLogs: true,
        },
      },
      auditLogs: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
            User Management & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage user accounts, roles, access status, and view security audit logs.
          </p>
        </div>
      </div>

      <UsersTable users={users} currentRole={currentRole} />
    </div>
  );
}
