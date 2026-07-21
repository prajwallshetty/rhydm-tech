import { NextRequest, NextResponse } from "next/server";
import { processGoogleUser } from "@/lib/auth/google";
import { Role } from "@/lib/generated/prisma/enums";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const mock = searchParams.get("mock");

  try {
    if (mock === "true" || !code) {
      // Mock Google OAuth sign in for development testing
      const mockGoogleId = "google_user_1029384756";
      const mockEmail = "alex.developer@example.com";
      await processGoogleUser({
        googleId: mockGoogleId,
        email: mockEmail,
        name: "Alex Developer",
        firstName: "Alex",
        lastName: "Developer",
        picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      });

      return NextResponse.redirect(new URL("/refurbished/account", req.url));
    }

    // Production Google OAuth code exchange
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/login?error=GoogleOAuthFailed", req.url));
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!googleUser.email) {
      return NextResponse.redirect(new URL("/login?error=NoGoogleEmail", req.url));
    }

    const user = await processGoogleUser({
      googleId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      picture: googleUser.picture,
    });

    const redirectPath = ([Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.EDITOR, Role.STAFF] as Role[]).includes(user.role)
      ? "/admin"
      : "/refurbished/account";

    return NextResponse.redirect(new URL(redirectPath, req.url));
  } catch (err) {
    console.error("Google OAuth Error:", err);
    return NextResponse.redirect(new URL("/login?error=OAuthException", req.url));
  }
}
