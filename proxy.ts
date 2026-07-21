import { NextResponse, type NextRequest } from "next/server";
import { DIVISION_COOKIE, SWITCH_PARAM, isDivision } from "@/lib/business";

const SESSION_COOKIE_NAME = "rhydm_session";
const ADMIN_COOKIE_NAME = "rhydm_admin_session";

const PROTECTED_ADMIN_ROUTES = ["/admin"];
const PROTECTED_CUSTOMER_ROUTES = ["/refurbished/account", "/refurbished/checkout"];
const AUTH_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const adminSessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const customerSessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isCustomerProtectedRoute = PROTECTED_CUSTOMER_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // 1. Unauthenticated user trying to access protected admin route
  if (isAdminRoute && !adminSessionToken && pathname !== "/admin/login") {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Unauthenticated user trying to access customer account / checkout
  if (isCustomerProtectedRoute && !customerSessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Logged-in user trying to open login or signup
  if (isAuthRoute && customerSessionToken) {
    return NextResponse.redirect(new URL("/refurbished/account", request.url));
  }

  // 4. Gateway division redirect
  if (pathname === "/") {
    if (searchParams.has(SWITCH_PARAM)) {
      return NextResponse.next();
    }

    const preference = request.cookies.get(DIVISION_COOKIE)?.value;
    if (isDivision(preference)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preference}`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/refurbished/account/:path*",
    "/refurbished/checkout",
    "/login",
    "/signup",
  ],
};
