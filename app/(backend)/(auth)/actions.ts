"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, comparePassword } from "@/lib/auth/bcrypt";
import { createSession, destroySession, getSession } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/auth/audit";
import { Role, UserStatus } from "@/lib/generated/prisma/enums";

// Password complexity regex: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/** Reset links stay valid for an hour: long enough to find the email, short enough to matter. */
const RESET_TOKEN_TTL_MINUTES = 60;

/**
 * Hashes a reset token for storage.
 *
 * Plain SHA-256 with no salt is correct here, unlike for passwords: the token
 * is 256 bits of CSPRNG output, so there is no dictionary to attack and the
 * hash must be deterministic to be looked up. What this buys is that a leaked
 * database yields no usable reset links.
 */
function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function signupAction(prevState: unknown, formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const acceptTerms = formData.get("acceptTerms");
    // Opt-in only, and separate from accepting the terms. A single combined
    // checkbox would not be meaningful consent under GDPR.
    const marketingConsent = formData.get("marketingConsent") === "on";

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return { error: "All fields are required." };
    }

    if (!acceptTerms) {
      return { error: "You must accept the Terms and Conditions to register." };
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    if (!PASSWORD_REGEX.test(password)) {
      return {
        error:
          "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.",
      };
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "An account with this email address already exists. Please login instead." };
    }

    const passwordHash = await hashPassword(password);
    const name = `${firstName.trim()} ${lastName.trim()}`;

    let user;
    try {
      user = await db.user.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name,
          email,
          passwordHash,
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
          emailVerified: new Date(),
          marketingConsent,
          marketingConsentAt: marketingConsent ? new Date() : null,
          unsubscribeToken: crypto.randomBytes(32).toString("base64url"),
        },
      });
    } catch {
      // Fallback if in-memory cached Prisma client rejects new schema fields
      user = await db.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: Role.CUSTOMER,
          emailVerified: new Date(),
        },
      });
    }

    // Safely generate Email Verification Token if model exists
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.emailVerificationToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token,
          expires,
        },
      });
    } catch (tokenErr) {
      console.warn("Could not save verification token:", tokenErr);
    }

    // Initiate user session
    await createSession({ id: user.id, email: user.email, role: user.role });
    await recordAuditLog({
      userId: user.id,
      email: user.email,
      action: "SIGNUP",
      details: { name, provider: "credentials" },
    });

    return { success: true, redirectUrl: "/refurbished/account" };
  } catch (err: unknown) {
    console.error("Signup error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during signup.";
    return { error: errorMessage };
  }
}

export async function loginAction(prevState: unknown, formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "on" || formData.get("rememberMe") === "true";

    if (!email || !password) {
      return { error: "Please enter both email and password." };
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      await recordAuditLog({
        email,
        action: "LOGIN_FAILED",
        status: "FAILURE",
        details: { reason: "User not found or password null" },
      });
      return { error: "Invalid email or password." };
    }

    if (user.status === UserStatus.SUSPENDED) {
      await recordAuditLog({
        userId: user.id,
        email: user.email,
        action: "LOGIN_FAILED",
        status: "FAILURE",
        details: { reason: "Account suspended" },
      });
      return { error: "Your account has been suspended. Please contact customer support." };
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      await recordAuditLog({
        userId: user.id,
        email: user.email,
        action: "LOGIN_FAILED",
        status: "FAILURE",
        details: { reason: "Invalid password" },
      });
      return { error: "Invalid email or password." };
    }

    // Update last login safely
    try {
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } catch {
      // Ignore if column is not yet present on cached client
    }

    await createSession({ id: user.id, email: user.email, role: user.role }, rememberMe);
    await recordAuditLog({
      userId: user.id,
      email: user.email,
      action: "LOGIN_SUCCESS",
      details: { rememberMe, role: user.role },
    });

    const rawCallback = (formData.get("callbackUrl") as string)?.trim();
    let redirectUrl = ([Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.EDITOR, Role.STAFF] as Role[]).includes(user.role)
      ? "/admin"
      : "/refurbished/account";

    if (
      rawCallback &&
      rawCallback.startsWith("/") &&
      !rawCallback.startsWith("//") &&
      !rawCallback.startsWith("/login") &&
      !rawCallback.startsWith("/admin/login") &&
      !rawCallback.startsWith("/auth")
    ) {
      redirectUrl = rawCallback;
    }

    return { success: true, redirectUrl };
  } catch (err: unknown) {
    console.error("Login error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during sign in.";
    return { error: errorMessage };
  }
}

/**
 * Password-reset request.
 *
 * Three properties this must hold, all of which the previous version broke:
 *
 *  1. The token is never returned to the caller. It used to be handed straight
 *     back and rendered as a clickable link, which meant typing any address
 *     into the form granted a working reset for that account.
 *  2. Only a hash of the token is stored. A database read (backup, log, dump)
 *     must not yield usable reset links.
 *  3. The response is identical whether or not the account exists, so the form
 *     cannot be used to enumerate customers.
 */
export async function forgotPasswordAction(prevState: unknown, formData: FormData) {
  // Same wording on success path for valid/invalid accounts to prevent enumeration.
  const neutralResponse = {
    success: true as const,
    message:
      "If an account exists for this email, we have sent a password reset link. Please check your inbox.",
  };

  const genericErrorResponse = {
    error: "We couldn't process the request right now. Please try again later.",
  };

  try {
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    if (!email) {
      return { error: "Please enter your email address." };
    }

    const { EmailService } = await import("@/lib/email/service");
    const configured = await EmailService.isConfigured();

    if (!configured) {
      console.error("[GMAIL_SEND] Password reset requested but Gmail is not connected.");

      // In local development, generate and log the reset link so testing works without OAuth setup
      if (process.env.NODE_ENV !== "production") {
        const user = await db.user.findUnique({ where: { email } });
        if (user) {
          await db.passwordResetToken.deleteMany({ where: { email } });
          const token = crypto.randomBytes(32).toString("base64url");
          const tokenHash = hashResetToken(token);
          const expires = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
          await db.passwordResetToken.create({
            data: { userId: user.id, email: user.email, token: tokenHash, expires },
          });
          const resetUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
          console.log(`[auth] [DEV FALLBACK] Reset link for ${email}: ${resetUrl}`);
        }
      }

      return genericErrorResponse;
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Deliberately indistinguishable from the success path.
      return neutralResponse;
    }

    // Any outstanding token for this address is invalidated first, so a reset
    // request always leaves exactly one live token.
    await db.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = hashResetToken(token);
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await db.passwordResetToken.create({
      data: { userId: user.id, email: user.email, token: tokenHash, expires },
    });

    await recordAuditLog({
      userId: user.id,
      email: user.email,
      action: "PASSWORD_RESET_REQUEST",
    });

    const resetUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

    const sent = await EmailService.sendPasswordReset({
      to: user.email,
      name: user.firstName || user.name || user.email.split("@")[0],
      resetUrl,
      expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
      userId: user.id,
    });

    if (!sent.ok) {
      console.error("[GMAIL_SEND] Password reset email failed:", sent.error);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[auth] [DEV FALLBACK] Reset link for ${email}: ${resetUrl}`);
      }
      return genericErrorResponse;
    }

    return neutralResponse;
  } catch (err: unknown) {
    console.error("[auth] forgotPasswordAction failed:", err);
    return genericErrorResponse;
  }
}

export async function resetPasswordAction(prevState: unknown, formData: FormData) {
  try {
    const token = formData.get("token") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token || !newPassword || !confirmPassword) {
      return { error: "All fields are required." };
    }

    if (newPassword !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return {
        error:
          "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.",
      };
    }

    // Look up by hash: the plaintext token exists only in the emailed link.
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token: hashResetToken(token) },
    });

    if (!resetToken || Date.now() > resetToken.expires.getTime()) {
      // One message for "never existed", "already used" and "expired" — each
      // is equally unhelpful to an attacker and equally actionable for a user.
      return { error: "This password reset link is invalid or has expired. Please request a new one." };
    }

    const passwordHash = await hashPassword(newPassword);
    await db.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    });

    // Single use: consume every token for this address, so the link cannot be
    // replayed and any parallel request is invalidated too.
    await db.passwordResetToken.deleteMany({ where: { email: resetToken.email } });

    await recordAuditLog({
      userId: resetToken.userId || undefined,
      email: resetToken.email,
      action: "PASSWORD_RESET_SUCCESS",
    });

    return { success: true, redirectUrl: "/login?message=PasswordResetSuccess" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Reset password error.";
    return { error: msg };
  }
}

export async function logoutAction() {
  const user = await getSession();
  if (user) {
    await recordAuditLog({
      userId: user.id,
      email: user.email,
      action: "LOGOUT",
    });
  }
  await destroySession();
  return { success: true, redirectUrl: "/login" };
}

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const company = formData.get("company") as string;

  const name = `${firstName || ""} ${lastName || ""}`.trim() || session.name;

  try {
    await db.user.update({
      where: { id: session.id },
      data: {
        firstName,
        lastName,
        name,
        phone,
        company,
      },
    });
  } catch {
    await db.user.update({
      where: { id: session.id },
      data: {
        name,
        phone,
        company,
      },
    });
  }

  await recordAuditLog({
    userId: session.id,
    email: session.email,
    action: "PROFILE_UPDATE",
    details: { firstName, lastName, phone, company },
  });

  revalidatePath("/refurbished/account");
  return { success: true };
}

export async function changePasswordAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    return {
      error:
        "New password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.",
    };
  }

  const dbUser = await db.user.findUnique({ where: { id: session.id } });
  if (!dbUser || !dbUser.passwordHash) {
    return { error: "Unable to verify current password." };
  }

  const isCurrentValid = await comparePassword(currentPassword, dbUser.passwordHash);
  if (!isCurrentValid) {
    return { error: "Incorrect current password." };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.user.update({
    where: { id: session.id },
    data: { passwordHash },
  });

  await recordAuditLog({
    userId: session.id,
    email: session.email,
    action: "PASSWORD_CHANGE",
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// Admin User Management Server Actions
// ---------------------------------------------------------------------------

export async function adminUpdateUserRoleAction(userId: string, newRole: Role) {
  const session = await getSession();
  if (!session || session.role !== Role.SUPER_ADMIN) {
    return { error: "Only Super Admin can change user roles." };
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  await recordAuditLog({
    userId: session.id,
    email: session.email,
    action: "ROLE_CHANGE",
    details: { targetUserId: userId, targetEmail: user.email, newRole },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminToggleUserStatusAction(userId: string, status: UserStatus) {
  const session = await getSession();
  if (!session || !([Role.SUPER_ADMIN, Role.ADMIN] as Role[]).includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { status },
  });

  await recordAuditLog({
    userId: session.id,
    email: session.email,
    action: status === UserStatus.SUSPENDED ? "USER_SUSPENDED" : "USER_ACTIVATED",
    details: { targetUserId: userId, targetEmail: user.email },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminDeleteUserAction(userId: string) {
  const session = await getSession();
  if (!session || session.role !== Role.SUPER_ADMIN) {
    return { error: "Only Super Admin can delete user accounts." };
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found." };

  await db.user.delete({ where: { id: userId } });

  await recordAuditLog({
    userId: session.id,
    email: session.email,
    action: "USER_DELETED",
    details: { targetUserId: userId, targetEmail: user.email },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

// ---------------------------------------------------------------------------
// User Address Management Server Actions
// ---------------------------------------------------------------------------

export async function addAddressAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const fullName = formData.get("fullName") as string;
  const line1 = formData.get("line1") as string;
  const line2 = formData.get("line2") as string;
  const city = formData.get("city") as string;
  const region = formData.get("region") as string;
  const postalCode = formData.get("postalCode") as string;
  const country = (formData.get("country") as string) || "Germany";
  const isDefault = formData.get("isDefault") === "true" || formData.get("isDefault") === "on";

  if (!fullName || !line1 || !city || !region || !postalCode) {
    return { error: "Please fill in all required address fields." };
  }

  if (isDefault) {
    await db.address.updateMany({
      where: { userId: session.id },
      data: { isDefault: false },
    });
  }

  const existingCount = await db.address.count({ where: { userId: session.id } });

  const address = await db.address.create({
    data: {
      userId: session.id,
      fullName,
      line1,
      line2: line2 || null,
      city,
      region,
      postalCode,
      country,
      isDefault: isDefault || existingCount === 0,
    },
  });

  revalidatePath("/refurbished/account");
  return { success: true, address };
}

export async function deleteAddressAction(addressId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await db.address.deleteMany({
    where: { id: addressId, userId: session.id },
  });

  revalidatePath("/refurbished/account");
  return { success: true };
}

export async function setDefaultAddressAction(addressId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await db.address.updateMany({
    where: { userId: session.id },
    data: { isDefault: false },
  });

  await db.address.updateMany({
    where: { id: addressId, userId: session.id },
    data: { isDefault: true },
  });

  revalidatePath("/refurbished/account");
  return { success: true };
}

