/**
 * Renewed Admin service worker.
 *
 * Security posture (deliberate): authenticated admin HTML and API/data
 * responses are NEVER written to Cache Storage — a shared or stolen device
 * must not expose orders/customers from a cache. Offline therefore means:
 * the app shell and static assets load, and navigations show the offline
 * page. Only immutable static assets and public icons are cached.
 */

const VERSION = "v1";
const STATIC_CACHE = `renewed-static-${VERSION}`;
const CORE = [
  "/admin-offline.html",
  "/admin-manifest.webmanifest",
  "/icons/admin-192.png",
  "/icons/admin-512.png",
  "/favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from previous versions.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("renewed-") && key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

// The update toast posts this to promote a waiting worker.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/favicon.svg" ||
    url.pathname === "/admin-manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return; // never intercept mutations

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never cache third parties

  // Immutable build assets + icons: cache-first (hashed filenames).
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Admin navigations: network only, offline fallback page. The response is
  // intentionally NOT cached — see the security note above.
  if (request.mode === "navigate" && url.pathname.startsWith("/admin")) {
    event.respondWith(
      fetch(request).catch(() => caches.match("/admin-offline.html")),
    );
  }
  // Everything else (data requests, server actions' GETs, public pages)
  // passes through untouched.
});
