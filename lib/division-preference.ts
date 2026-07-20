/**
 * Client-side persistence of the visitor's division choice.
 *
 * Written as a cookie rather than localStorage so `proxy.ts` can read it on the
 * server and redirect before the gateway renders. Mirrored into localStorage
 * purely as a convenience for client code that wants the value without parsing
 * `document.cookie`.
 */

import {
  DIVISION_COOKIE,
  DIVISION_COOKIE_MAX_AGE,
  type Division,
} from "@/lib/business";

export function rememberDivision(division: Division) {
  if (typeof document === "undefined") return;

  document.cookie = [
    `${DIVISION_COOKIE}=${division}`,
    "path=/",
    `max-age=${DIVISION_COOKIE_MAX_AGE}`,
    "samesite=lax",
  ].join("; ");

  try {
    window.localStorage.setItem(DIVISION_COOKIE, division);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies) — the cookie
    // above is the source of truth, so this is safe to ignore.
  }
}

export function forgetDivision() {
  if (typeof document === "undefined") return;

  document.cookie = `${DIVISION_COOKIE}=; path=/; max-age=0; samesite=lax`;

  try {
    window.localStorage.removeItem(DIVISION_COOKIE);
  } catch {
    // See above.
  }
}
