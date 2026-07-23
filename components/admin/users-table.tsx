"use client";

import { useState } from "react";
import {
  Search,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Clock,
  Shield,
  Activity,
  History,
  AlertTriangle,
} from "lucide-react";
import { Role, UserStatus } from "@/lib/generated/prisma/enums";
import {
  adminUpdateUserRoleAction,
  adminToggleUserStatusAction,
  adminDeleteUserAction,
} from "@/app/(backend)/(auth)/actions";

interface UserItem {
  id: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
  role: Role;
  status: UserStatus;
  googleId: string | null;
  phone: string | null;
  company: string | null;
  lastLoginAt: Date | string | null;
  createdAt: Date | string;
  _count: {
    orders: number;
    auditLogs: number;
  };
  auditLogs: Array<{
    id: string;
    action: string;
    status: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date | string;
  }>;
}

export function UsersTable({
  users,
  currentRole,
}: {
  users: UserItem[];
  currentRole: Role;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedUserLogs, setSelectedUserLogs] = useState<UserItem | null>(null);

  const isSuperAdmin = currentRole === Role.SUPER_ADMIN;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company || "").toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!isSuperAdmin) {
      alert("Only Super Admin can change user roles.");
      return;
    }
    await adminUpdateUserRoleAction(userId, newRole);
  };

  const handleStatusToggle = async (userId: string, currentStatus: UserStatus) => {
    const nextStatus = currentStatus === UserStatus.SUSPENDED ? UserStatus.ACTIVE : UserStatus.SUSPENDED;
    await adminToggleUserStatusAction(userId, nextStatus);
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!isSuperAdmin) {
      alert("Only Super Admin can delete user accounts.");
      return;
    }
    if (confirm(`Are you sure you want to permanently delete user ${email}?`)) {
      await adminDeleteUserAction(userId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between dark:border-border dark:bg-card">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-[#2E6F40] dark:border-border dark:bg-muted/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#2E6F40] dark:border-border dark:bg-card dark:text-foreground"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="EDITOR">Editor</option>
            <option value="STAFF">Staff</option>
            <option value="CUSTOMER">Customer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#2E6F40] dark:border-border dark:bg-card dark:text-foreground"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-border dark:bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/30 font-extrabold uppercase text-slate-400">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Provider</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Login</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-medium">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-muted/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-[#2E6F40] text-white font-black text-xs shrink-0">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User"}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          {u.company && (
                            <div className="text-[10px] font-bold text-[#2E6F40]">{u.company}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                        {u.googleId ? "Google OAuth" : "Email & Password"}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {isSuperAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-extrabold text-slate-900 outline-none focus:border-[#2E6F40] dark:border-border dark:bg-card dark:text-white cursor-pointer"
                        >
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="STAFF">STAFF</option>
                          <option value="CUSTOMER">CUSTOMER</option>
                        </select>
                      ) : (
                        <span className="font-extrabold text-slate-800 dark:text-white text-[11px]">
                          {u.role}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          u.status === UserStatus.ACTIVE
                            ? "bg-[#E8F5E9] text-[#2E6F40]"
                            : u.status === UserStatus.SUSPENDED
                            ? "bg-red-50 text-red-600 dark:bg-red-950/50"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/50"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-500 font-medium text-[11px]">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString()
                        : "Never"}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Audit Logs */}
                        <button
                          onClick={() => setSelectedUserLogs(u)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-muted transition-colors cursor-pointer"
                          title="View Login History & Audit Logs"
                        >
                          <History className="size-4" />
                        </button>

                        {/* Toggle Suspend / Activate */}
                        <button
                          onClick={() => handleStatusToggle(u.id, u.status)}
                          className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                            u.status === UserStatus.SUSPENDED
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-amber-600 hover:bg-amber-50"
                          }`}
                          title={u.status === UserStatus.SUSPENDED ? "Activate User" : "Suspend User"}
                        >
                          {u.status === UserStatus.SUSPENDED ? (
                            <UserCheck className="size-4" />
                          ) : (
                            <UserX className="size-4" />
                          )}
                        </button>

                        {/* Delete User (Super Admin only) */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(u.id, u.email)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Modal */}
      {selectedUserLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-border dark:bg-card space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="size-4 text-[#2E6F40]" />
                  <span>Audit Logs & Login History</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedUserLogs.email} ({selectedUserLogs.name || "User"})
                </p>
              </div>
              <button
                onClick={() => setSelectedUserLogs(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {selectedUserLogs.auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No audit logs recorded for this user yet.
                </div>
              ) : (
                selectedUserLogs.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs dark:border-border dark:bg-muted/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>IP: {log.ipAddress || "Unknown"}</span>
                      <span className="truncate max-w-xs">{log.userAgent || "Web"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
