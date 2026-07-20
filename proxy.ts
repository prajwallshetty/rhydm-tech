import { NextResponse, type NextRequest } from "next/server";

import {
  DIVISION_COOKIE,
  SWITCH_PARAM,
  isDivision,
} from "@/lib/business";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`, and the named export from
 * `middleware` to `proxy`. The `edge` runtime is not supported here — `proxy`
 * always runs on `nodejs` and that is not configurable.
 *
 * Returning visitors who already picked a division are redirected off the
 * gateway before any HTML is streamed, so they never see it flash.
 */
export function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // "Switch Business" links to /?switch=1 — always show the gateway there.
  if (searchParams.has(SWITCH_PARAM)) {
    return NextResponse.next();
  }

  const preference = request.cookies.get(DIVISION_COOKIE)?.value;
  if (!isDivision(preference)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${preference}`;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Only the gateway needs this check — keeps the proxy off every other route.
  matcher: "/",
};
