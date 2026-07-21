import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { Role, UserStatus } from "@/lib/generated/prisma/enums";

const SESSION_COOKIE_NAME = "rhydm_session";
const SECRET = process.env.AUTH_SECRET || process.env.ADMIN_JWT_SECRET || "rhydm-tech-enterprise-secret-key-2026";

interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  rememberMe: boolean;
  expiresAt: number;
}

function generateSignature(payloadStr: string): string {
  return crypto.createHmac("sha256", SECRET).update(payloadStr).digest("hex");
}

export async function createSession(
  user: { id: string; email: string; role: Role },
  rememberMe = false,
) {
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days vs 24 hours
  const expiresAt = Date.now() + durationMs;

  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    rememberMe,
    expiresAt,
  };

  const payloadStr = JSON.stringify(payload);
  const signature = generateSignature(payloadStr);

  const token = Buffer.from(JSON.stringify({ payloadStr, signature })).toString("base64url");

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(durationMs / 1000),
  });

  // Keep admin cookie sync for legacy admin checks if user has admin/staff roles
  if (([Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.EDITOR, Role.STAFF] as Role[]).includes(user.role)) {
    cookieStore.set("rhydm_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(durationMs / 1000),
    });
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete("rhydm_admin_session");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || cookieStore.get("rhydm_admin_session")?.value;
  if (!token) return null;

  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const { payloadStr, signature } = JSON.parse(raw);

    if (!payloadStr || !signature) return null;
    const expectedSig = generateSignature(payloadStr);
    if (signature !== expectedSig) return null;

    const payload: SessionPayload = JSON.parse(payloadStr);
    if (Date.now() > payload.expiresAt) {
      await destroySession();
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true,
        googleId: true,
        emailVerified: true,
        phone: true,
        company: true,
        createdAt: true,
      },
    });

    if (!user || user.status === UserStatus.SUSPENDED) {
      await destroySession();
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(allowedRoles?: Role[]) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    redirect("/login?error=UnauthorizedAccess");
  }

  return user;
}
