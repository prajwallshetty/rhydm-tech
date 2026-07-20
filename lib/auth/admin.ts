import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { Role } from "@/lib/generated/prisma/enums";

const ADMIN_COOKIE_NAME = "rhydm_admin_session";
const SECRET = process.env.ADMIN_JWT_SECRET || "rhydm-admin-secret-key-2026";

function hashToken(userId: string, timestamp: number): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(`${userId}:${timestamp}`)
    .digest("hex");
}

export async function createAdminSession(userId: string) {
  const timestamp = Date.now();
  const signature = hashToken(userId, timestamp);
  const token = Buffer.from(JSON.stringify({ userId, timestamp, signature })).toString("base64url");

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const { userId, timestamp, signature } = JSON.parse(raw);

    if (!userId || !timestamp || !signature) return null;
    const expected = hashToken(userId, timestamp);
    if (signature !== expected) return null;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });

    if (!user || user.role !== Role.ADMIN) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}

export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "rhydm-salt-2026", 1000, 64, "sha512").toString("hex");
}
