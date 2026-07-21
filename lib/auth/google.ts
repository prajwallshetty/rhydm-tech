import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/auth/audit";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`;

export function getGoogleAuthUrl(): string {
  if (!GOOGLE_CLIENT_ID) {
    // Development fallback simulation mode
    return `/api/auth/google/callback?mock=true`;
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export async function processGoogleUser({
  googleId,
  email,
  name,
  firstName,
  lastName,
  picture,
}: {
  googleId: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}) {
  // 1. Check if user exists by email or googleId
  let user = await db.user.findFirst({
    where: {
      OR: [{ googleId }, { email }],
    },
  });

  if (user) {
    try {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          googleId,
          emailVerified: user.emailVerified || new Date(),
          image: user.image || picture,
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
          name: user.name || name || `${firstName || ""} ${lastName || ""}`.trim(),
          lastLoginAt: new Date(),
        },
      });
    } catch {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: user.emailVerified || new Date(),
          image: user.image || picture,
          name: user.name || name || email.split("@")[0],
        },
      });
    }
  } else {
    try {
      user = await db.user.create({
        data: {
          email,
          googleId,
          firstName: firstName || name?.split(" ")[0] || "User",
          lastName: lastName || name?.split(" ").slice(1).join(" ") || "",
          name: name || `${firstName || ""} ${lastName || ""}`.trim() || email.split("@")[0],
          image: picture,
          emailVerified: new Date(),
          role: "CUSTOMER",
          status: "ACTIVE",
          lastLoginAt: new Date(),
        },
      });
    } catch {
      user = await db.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          image: picture,
          emailVerified: new Date(),
          role: "CUSTOMER",
        },
      });
    }
  }

  // 3. Create session & record audit log
  await createSession({ id: user.id, email: user.email, role: user.role });
  await recordAuditLog({
    userId: user.id,
    email: user.email,
    action: "GOOGLE_LOGIN",
    details: { provider: "google", googleId },
  });

  return user;
}
