import { Role } from "@/lib/generated/prisma/enums";

export type Permission =
  | "ALL"
  | "DELETE_USER"
  | "CHANGE_ROLES"
  | "MANAGE_PERMISSIONS"
  | "SYSTEM_SETTINGS"
  | "MANAGE_USERS"
  | "PRODUCTS_READ"
  | "PRODUCTS_WRITE"
  | "PRODUCTS_DELETE"
  | "ORDERS_READ"
  | "ORDERS_WRITE"
  | "CATEGORIES_READ"
  | "CATEGORIES_WRITE"
  | "CUSTOMERS_READ"
  | "CUSTOMERS_WRITE"
  | "BLOG_READ"
  | "BLOG_WRITE"
  | "MEDIA_READ"
  | "MEDIA_WRITE"
  | "DISPOSAL_CMS_READ"
  | "DISPOSAL_CMS_WRITE"
  | "ANALYTICS_READ";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: ["ALL"],
  ADMIN: [
    "MANAGE_USERS",
    "PRODUCTS_READ",
    "PRODUCTS_WRITE",
    "PRODUCTS_DELETE",
    "ORDERS_READ",
    "ORDERS_WRITE",
    "CATEGORIES_READ",
    "CATEGORIES_WRITE",
    "CUSTOMERS_READ",
    "CUSTOMERS_WRITE",
    "BLOG_READ",
    "BLOG_WRITE",
    "MEDIA_READ",
    "MEDIA_WRITE",
    "DISPOSAL_CMS_READ",
    "DISPOSAL_CMS_WRITE",
    "ANALYTICS_READ",
  ],
  MANAGER: [
    "PRODUCTS_READ",
    "PRODUCTS_WRITE",
    "ORDERS_READ",
    "ORDERS_WRITE",
    "CATEGORIES_READ",
    "CATEGORIES_WRITE",
    "CUSTOMERS_READ",
    "BLOG_READ",
    "MEDIA_READ",
    "ANALYTICS_READ",
  ],
  EDITOR: [
    "BLOG_READ",
    "BLOG_WRITE",
    "MEDIA_READ",
    "MEDIA_WRITE",
    "PRODUCTS_READ",
  ],
  STAFF: [
    "ORDERS_READ",
    "PRODUCTS_READ",
    "CUSTOMERS_READ",
  ],
  CUSTOMER: [],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes("ALL")) return true;
  return permissions.includes(permission);
}

export function isStaffOrAdmin(role: Role): boolean {
  return ([Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.EDITOR, Role.STAFF] as Role[]).includes(role);
}

export function isSuperAdmin(role: Role): boolean {
  return role === Role.SUPER_ADMIN;
}
