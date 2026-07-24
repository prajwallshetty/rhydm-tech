import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { DIVISION_COOKIE, SWITCH_PARAM, isDivision } from "@/lib/business";

const SESSION_COOKIE_NAME = "rhydm_session";
const ADMIN_COOKIE_NAME = "rhydm_admin_session";

/** Unlocalized surface — the intl middleware must never touch these. */
const BACKEND_PREFIXES = [
  "/admin",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api",
];

const AUTH_ROUTES = ["/login", "/signup", "/auth"];

const intlMiddleware = createIntlMiddleware(routing);

const LOCALE_PATTERN = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

/** "/de/refurbished/cart" → "/refurbished/cart"; "/de" → "/". */
function stripLocale(pathname: string) {
  const stripped = pathname.replace(LOCALE_PATTERN, "");
  return stripped === "" ? "/" : stripped;
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const adminSessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const customerSessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // ---------------------------------------------------------------- backend
  if (BACKEND_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (pathname === "/admin/login" && adminSessionToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
      pathname.startsWith("/admin") &&
      !adminSessionToken &&
      pathname !== "/admin/login"
    ) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname + (request.nextUrl.search || ""));
      return NextResponse.redirect(loginUrl);
    }

    if (AUTH_ROUTES.includes(pathname) && customerSessionToken) {
      const locale =
        request.cookies.get("NEXT_LOCALE")?.value ?? routing.defaultLocale;
      return NextResponse.redirect(
        new URL(`/${locale}/refurbished/account`, request.url),
      );
    }

    return NextResponse.next();
  }

  // ----------------------------------------------------------------- public
  const pathNoLocale = stripLocale(pathname);

  // Alias /account (and /de/account, etc.) to /refurbished/account with params
  if (pathNoLocale === "/account" || pathNoLocale.startsWith("/account/")) {
    const localeMatch = pathname.match(LOCALE_PATTERN);
    const locale =
      localeMatch?.[1] ??
      request.cookies.get("NEXT_LOCALE")?.value ??
      routing.defaultLocale;
    const targetUrl = new URL(`/${locale}/refurbished/account`, request.url);
    searchParams.forEach((val, key) => targetUrl.searchParams.set(key, val));
    if (!customerSessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", targetUrl.pathname + targetUrl.search);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(targetUrl);
  }

  // Customer-protected routes (now locale-prefixed).
  if (
    (pathNoLocale.startsWith("/refurbished/account") ||
      pathNoLocale === "/refurbished/checkout") &&
    !customerSessionToken
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + (request.nextUrl.search || ""));
    return NextResponse.redirect(loginUrl);
  }



  // Locale detection, "/" → "/en" redirect, NEXT_LOCALE cookie persistence.
  return intlMiddleware(request);
}

export const config = {
  // Everything except static assets and files with extensions.
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
