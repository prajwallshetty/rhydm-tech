# Build Progress

> **2026-07-24 — admin notification center + audit pass.** The header bell is
> now a real feed: `getAdminNotifications()` aggregates live actionable counts
> (orders to process, reviews to moderate, new enquiries, low stock) into a
> dropdown with a true badge, re-fetched with the 15s layout refresh; empty =
> "all caught up" (no fabricated items). Audit fixes: relabelled the misleading
> "Banners" sidebar item to "Disposal CMS" (it opens the whole disposal CMS);
> added the missing empty state to `/admin/brands`. Every sidebar route now
> resolves (no broken nav). Still open (no migration, lower priority): a full
> CMS-split *reorg* of site-content-manager, and a broader perf pass.


Living record of what exists, what is verified, and what is next. **Update this
as work lands** — it is the handover document between sessions, so it should be
accurate even when nobody remembers the conversation that produced it.

Last updated: 2026-07-24

> **2026-07-24 — admin panel audit + module build-out (phase 1 of a larger
> program).** Audit corrected several stale premises: the sidebar already
> rendered `/logo.png` (not a "Renewed" wordmark); "Inventory", "Reviews",
> "Coupons" and "Roles & Permissions" were **placeholder links pointing at
> existing pages**, not real modules; toasts already worked (the header bell
> was a static fake showing "8"); `Review` and `Coupon` models existed in the
> schema with **zero application code**; `Role` is a `User` enum (no RBAC
> tables). So this was largely a build-out, not a bug-fix pass.
>
> **Shipped this pass:**
> - **Admin shell:** shared `useAdminUi` store (`lib/store/admin-ui.ts`, zustand
>   + persist) drives a real desktop **collapse-to-icon-rail** (smooth width
>   transition, tooltips via `title`, persisted, mobile drawer unaffected). The
>   header menu button now toggles it (previously it had no handler wired). Chat
>   (`MessageSquare`) button removed; fabricated bell "8" removed; footer shows
>   the real admin email/name; "Renewed" strings replaced with `COMPANY.name`.
>   "Roles & Permissions" sidebar item removed (auth `Role` enum kept).
> - **Reviews** (`/admin/reviews`): list with per-review moderation (verify
>   toggle, delete), search (author/title/body/product), rating + verified
>   filters, stat row, pagination, empty state. Revalidates the storefront.
> - **Coupons** (`/admin/coupons`): full CRUD over the `Coupon` model
>   (PERCENT/FIXED, value, min-spend, expiry, active), enable/disable, delete,
>   dialog form with validation. **Checkout validation is live:** cart calls
>   `validateCoupon()` (server-side: existence/active/expiry/min-spend, discount
>   computed on the server so a tampered client can't fake it); `calculateTotals`
>   gained an optional `discountCents` and the cart shows a Discount row.
> - **Inventory** (`/admin/inventory`): stock-focused view over `Product`
>   (SKUs, units on hand, low/out-of-stock stats + filters, inline stock edit,
>   search, pagination). Syncs to storefront on save.
>
> All typecheck + full production build clean; sidebar hrefs now resolve (no
> broken nav). **Deferred (need a Prisma migration against shared Neon — kept
> out of this turn deliberately):** review approve/reject *status* (only
> `verified` exists today), coupon product/category scoping + usage-limit +
> one-time, inventory movement history / warehouse / reserved stock, category
> image/banner/thumbnail/icon fields, testimonial `featured`/`order` for DnD.
> **Still to build (no migration):** testimonials CMS, CMS split
> consolidation, cross-admin consistency sweep. Carrying an applied coupon into
> the *placed order* is a follow-up (schema already notes coupons are "UI-only
> until payments integrated").
>
> **Follow-up landed same day — dashboard charts.** `/admin/analytics` was the
> only surface still on placeholder data (the main `/admin` dashboard was
> already live). Replaced its hardcoded `monthlyRevenue` + hand-rolled bars
> with **Recharts (3.10) + a small shadcn-style `components/ui/chart.tsx`**
> primitive (theme-aware via `--color-*` CSS vars, responsive). Four responsive
> line/area charts — Revenue, Orders, Sales (units), Product Views — plus a
> six-metric live snapshot row (revenue/orders/customers/products/units-in-
> stock/low-stock). All fed by a new `getAnalyticsOverview(months)` that
> aggregates real orders / order-items / `RecentlyViewed` events by month in
> memory (zero-filled buckets, no invented numbers); "Views" is honestly the
> `RecentlyViewed` signal, not fabricated visitor analytics. Removed the now
> orphaned `getAdminAnalyticsData`.
>
> **Follow-up landed same day — migration-gated feature set (applied).**
> Migration `20260724000000_admin_enhancements` **applied to Neon via
> `prisma migrate deploy`** (the migrate CLI had a transient P1001 cold-start
> first; the app's pg-adapter path was reachable throughout). Built on it:
> - **Review moderation (#2):** `ReviewStatus` (PENDING/APPROVED/REJECTED);
>   `/admin/reviews` gains approve/reject + a status filter + a Pending stat;
>   storefront `getProductBySlug` now shows only APPROVED reviews. Existing
>   reviews were backfilled to APPROVED; new ones default to PENDING.
> - **Inventory movement history (#1):** `StockMovement` ledger; stock edits
>   now write a signed delta + running balance atomically (`updateProductStock`
>   in a tx); a per-product history drawer on `/admin/inventory`.
> - **Coupon scoping/usage (#7):** `usageLimit`/`usageCount`/`oncePerCustomer`/
>   `redeemedBy[]`/`productIds[]`/`categoryIds[]` (slugs). Admin form gains
>   usage cap, once-per-customer, category multi-select + product-slug scope;
>   `validateCoupon` enforces scope + usage cap server-side (cart passes its
>   item slugs). Note: `usageCount`/`oncePerCustomer` fully bite only once an
>   order records redemption (still "UI-only until payments").
> - **Category images (#10):** `bannerUrl`/`thumbnailUrl`/`iconUrl` (imageUrl
>   pre-existed) editable on new/edit category forms; storefront category cards
>   + home collection circles prefer the CMS image, falling back to the
>   generated placeholder. Banner/icon are stored and ready to surface.
> - **Testimonial featured (#9):** `featured` flag in the CMS form + a badge;
>   both storefronts order featured-first.
> Typecheck + full production build clean against the migrated DB.
>
> **Earlier same day — Testimonials CMS.** Dedicated `/admin/
> testimonials` managing both divisions (Refurbished / Disposal tabs): create/
> edit dialog (author, role/title, company, rating, photo URL, quote, publish
> toggle), delete, and **drag-to-reorder** (native HTML5 DnD + up/down button
> fallback for a11y) persisting the existing `Testimonial.position` — no
> migration needed. Uses new `getAdminTestimonials`/`upsertTestimonialFull`/
> `setTestimonialStatus`/`reorderTestimonials`. **De-duplicated:** removed the
> testimonials editor tab from `disposal-cms` (it wrote incomplete rows and
> duplicated this) — the tab now links to the dedicated CMS; deleted the
> orphaned `saveTestimonialAction`/`deleteTestimonialAction`/`upsertTestimonial`.
> Both storefronts consume it: disposal already filtered PUBLISHED + ordered by
> position; wired the **refurbished home** to `getStoreTestimonials()` (added
> `avatarUrl`) so CMS entries render there, falling back to the existing
> hardcoded cards when none are published. "Featured toggle" maps to publish/
> hide (no `featured` column — a distinct flag would need a migration).

> **2026-07-22 — repo reorganised by collaborator (prajwallshetty):** routes
> moved into groups (`app/(disposal)/disposal/…`, `app/(refurbished)/…`,
> `app/(admin)/admin/…`, `app/(auth)/…`); an admin CMS, auth (OAuth + password),
> and account area were added. The `passwordHash` field was applied with
> `db push`, so there is **no migration** for it — regenerate the client
> (`npm run db:generate`) after pulling if Prisma types look stale.

> **2026-07-22 — admin made live.** The dashboard previously rendered
> hardcoded numbers (₹ figures, fake customers); it now renders entirely from
> queries (`getDashboardStats`, `getSalesByDay`, `getTopProducts`,
> `getSalesByCategory`, `getRecentOrders`) with honest empty states and no
> invented trend percentages. `AutoRefresh` in the admin layout re-runs the
> Server Components every 15s (paused for hidden tabs), so orders/CMS data
> stay current without reloads. Revalidation coverage fixed: disposal CMS
> mutations now `revalidatePath("/disposal", "layout")` and product/category/
> brand mutations `revalidatePath("/refurbished", "layout")` — before this,
> CMS edits never reached the statically-prerendered public pages. Sidebar:
> Refunds (pointed at a non-existent REFUNDED status) and Attributes
> (duplicate of Inventory) removed.
>
> Known debt in collaborator admin code, flagged not fixed: 29 pre-existing
> lint errors (`any` casts); seed prints admin credentials; PBKDF2 at 1k
> iterations with static salt; hardcoded fallback `ADMIN_JWT_SECRET` in
> `lib/auth/admin.ts` — set a real secret in production env.

> **2026-07-22 — /disposal ITAD landing redesigned** (`components/disposal/itad/*`).
> Sections for services, process, FAQs, testimonials and compliance are driven
> by the CMS tables (edits in /admin/disposal appear without a deploy); hero,
> bento, comparison, showcase, lifecycle and CTAs are static per the approved
> spec. Palette: gray-900 / blue-600 / emerald-500 (exact spec hexes as
> Tailwind classes). The previous static landing components
> (`components/disposal/disposal-*.tsx`) are no longer rendered by the page but
> were intentionally left in the tree for comparison — delete once the redesign
> is signed off.

> **2026-07-23 — Admin PWA.** /admin installs as "Renewed Admin"
> (standalone, #16A34A, portrait): `public/admin-manifest.webmanifest`
> (id/scope /admin, 192/512/maskable icons regenerated from the pre-resample
> 1024px source recovered from git history, 5 shortcuts to real routes),
> hand-written `public/sw.js` (no workbox), offline page, and
> `PwaProvider` in the admin layout — SW registration, glass install banner
> (beforeinstallprompt, dismissal persisted, hides on appinstalled/
> standalone), and an update toast (waiting-worker detection → SKIP_WAITING
> → reload on controllerchange). Manifest metadata lives on the admin
> layout only, so public pages don't reference it.
>
> **Deliberate security posture:** authenticated admin HTML and data are
> NEVER written to Cache Storage (the spec's "cache orders/customers
> offline" conflicts with its own "never expose private API responses" —
> security won, like Stripe's dashboard). Cache-first is limited to
> immutable /_next/static, icons, fonts; admin navigations are network-only
> with the offline page as fallback; non-GET and cross-origin are never
> intercepted.
>
> Verified in real headless Chrome: SW registers + activates, precache +
> runtime cache contain only static assets (zero admin HTML — checked), and
> with the server killed an uncached /admin route serves the offline page.
> (Gotcha for future tests: Puppeteer's setOfflineMode does NOT apply to
> service-worker fetches — kill the server to test offline.) Manifest JSON
> validated; linked on admin pages only.
>
> Deferred, stated: Background Sync action queue, Web Push (needs VAPID
> keys + subscription storage), sidebar/filter state persistence, iOS
> splash-screen image set (apple-touch-icon + appleWebApp meta are in).
> Note: Lighthouse removed its PWA category in v12 — "PWA 100" is no longer
> a thing that can be scored.

> **2026-07-23 — Cloudinary media library.** Signed direct-to-Cloudinary
> uploads: `lib/media/cloudinary.ts` (no SDK — SHA-1 signing verified against
> Cloudinary's documented test vector), server actions sign → browser POSTs
> bytes straight to Cloudinary → `recordMediaUploadAction` persists the
> MediaAsset (payload whitelisted; URL must be res.cloudinary.com). Secret
> never leaves the server; file bytes never transit it. /admin/media rebuilt:
> drag-drop multi-upload with per-file progress + retry, canonical folder set
> (`lib/media/folders.ts`, all under `rhydm/`), search + type/folder filters,
> alt-text editing, and delete protection that reports exactly where an asset
> is referenced (product images, variant images, certifications, posts) with
> a "delete anyway" confirm. Reusable `<MediaPicker>` dialog (library browse
> + upload-new auto-selects) wired into the product form — the manual
> "Image URLs (comma separated)" input is gone; the hidden `name="images"`
> comma-join contract is preserved so `saveProductAction` is untouched.
> next/image remotePatterns allow res.cloudinary.com.
>
> **Requires user action to go live:** set `CLOUDINARY_CLOUD_NAME` /
> `API_KEY` / `API_SECRET` (see .env.example). Until then /admin/media shows
> a clear not-configured banner and uploads are disabled — everything else
> (browse, delete, alt, picker over existing assets) works. Live upload
> round-trip is the one thing not yet exercised (needs real credentials).
> Deferred from the brief: bulk ops, favorites, crop/rotate editing, storage
> analytics dashboard, variant-image picker (no variant-image admin UI exists
> yet to wire into), blog/CMS-section image fields (registry supports adding
> an image field type next).

> **2026-07-23 — performance pass, measured with Lighthouse (mobile).**
> Baseline exposed that the i18n restructure had silently made every public
> route dynamic — next-intl needs `setRequestLocale()` in *every* page AND
> nested layout (App Router layouts render in isolated scopes); only the
> root layout had it. Restored: landings, product pages, cart, checkout,
> wishlist are ● SSG again; only auth/search/filtered routes stay ƒ.
> Images: source PNGs were absurd (1.4MB logo rendered at 36px) — resampled
> 9.3MB → 2.2MB; store hero converted to next/image (priority + sizes);
> disposal hero got a `sizes` cap (was fetching w=3840).
> LCP: BlurReveal/WordReveal/FadeIn held all hero text at Motion's
> `initial opacity:0` until hydration (7–11s LCP on throttled mobile).
> Rewritten as CSS animations (`.animate-reveal`, identical curves/stagger);
> keyframes start at opacity 0.01 because Chrome permanently disqualifies
> elements first painted fully transparent from LCP (the gateway scored
> null/NO_LCP). Deliberate trade-off: below-fold reveals now play on load,
> not on scroll-into-view. Store hero's inline motion text wrappers got the
> same treatment (image float keeps Motion).
> SEO 92→100: every page carried its pre-i18n canonical (`/refurbished`),
> now a redirecting URL = invalid; stale canonicals stripped and the
> layout-level hreflang block (which wrongly pointed all pages at the two
> homepages) removed — sitemap still carries correct per-URL hreflang.
> **Follow-up:** a small helper for proper per-page localized canonicals +
> hreflang. A11y: disposal hamburger label, switcher visible-name mismatch,
> footer heading order, decorative watermark/alt fixes.
>
> Scores (mobile, before → after): gateway perf 75→95 (LCP 11.0s→3.0s),
> disposal 76→89 (7.4s→3.8s), store 80→89 (5.5s→3.7s); SEO 92→100 all;
> BP 100; a11y 96–100. Overflow + tap-target audits re-run clean.
> Remaining to reach 90+ perf on the two 89s: ~100KB unused JS
> (motion/next-intl chunks) — bundle surgery, diminishing returns.

> **2026-07-23 — i18n translation completeness pass.** Second i18n pass:
> drove the static-string audit from a 1,245-string baseline (custom scanner,
> `scripts/i18n-audit.mjs`) to 0 real hardcoded strings (4 remaining are brand
> names + a TS type — legit). Every visible UI string on public routes now
> switches en↔de. New message namespaces (`messages/{en,de}.json`, 577 keys,
> exact parity): `store` (condition/stock/sort/filters/search/product/cart/
> checkout/wishlist/pagination/detail/home/deals/pages), `disposal` (all
> subpage chrome + itad homepage sections: compliance/services/industries/
> testimonials/process/hero + contactForm with localized zod messages),
> `account` (full customer panel incl. order statuses), `errors` (404), and an
> expanded shared `common`. `lib/format.ts` stock/condition helpers now expose
> tone/count/enum-key so callers translate (no English baked in); `lib/store/
> sort.ts` carries message keys. Locale-aware order dates via `getLocale()`.
> Deleted 11 dead components found during the sweep (7 legacy `disposal-*`, 4
> unused `itad/*`). Verified live against a production build: German renders on
> cart/shop/disposal-faqs/disposal-home, English control unaffected, build
> clean. **Still English (deferred, by design):** DB content (products,
> services, FAQs, testimonials, categories — needs translation tables), the
> admin panel (`app/(backend)`, intentionally English), and transactional
> emails.
>
> **2026-07-23 — i18n (en/de) via next-intl.** Public routes moved to
> `app/(site)/[locale]/…`; admin/auth moved to `app/(backend)/…` — two root
> layouts via route groups (public gets `<html lang={locale}>` + intl
> provider; backend stays English). `proxy.ts` composes the next-intl
> middleware with the existing auth guards and division redirect (now
> locale-aware: `/de` + division cookie → `/de/refurbished`). Legacy URLs
> (`/disposal`) 307 to `/en/…`; German browsers land on `/de`; NEXT_LOCALE
> cookie persists the choice. Public components import Link/useRouter/
> usePathname from `@/i18n/navigation` (admin keeps next/link — i18n Link
> would locale-prefix `/admin` hrefs). LanguageSwitcher lives in both
> floating navs. CMS content is per-locale: German rows at `${key}#de`,
> merge order defaults → en → de, so untranslated fields fall back to
> English, never blank; /admin/content has EN/DE tabs. Sitemap emits every
> URL per locale with hreflang alternates; layout metadata carries
> en/de/x-default. Verified live: 6 routing behaviors, German gateway/nav/
> footer, CMS de-override round-trip, 156-page build (78×2).
>
> **Translated so far:** gateway, both navs, footer, switcher, CMS sections
> (via admin). **Still English everywhere:** database content (products,
> services, FAQs, testimonials, categories — needs translation tables),
> in-page hardcoded copy on store/disposal subpages (cart, checkout,
> account, product pages…), form validation messages, and per-page metadata.
> Adding a locale = one line in `i18n/routing.ts` + `messages/<locale>.json`.

> **2026-07-22 — Site Content CMS (section registry).** Free-form page copy
> is now CMS-editable through one mechanism: `lib/cms/registry.ts` defines
> each editable section (fields + defaults = the previously hardcoded copy),
> `lib/cms/content.ts` merges saved PageSection JSON over those defaults
> (empty/missing fields fall back, so a fresh DB renders identically and
> clearing a field restores original copy), and `/admin/content` renders a
> schema-driven form for every registered section — adding a new editable
> section is a registry entry, no new admin UI. Wired: disposal hero, why/stat
> cards, comparison, final CTA; store hero; footer social links.
> `saveSiteSectionAction` filters payloads against the registry (only
> registered keys survive) and revalidates the owning division's layout.
> Keys are namespaced `section.*`/`site.*` so legacy `disposal.hero` rows
> (edited by the old Disposal CMS hero tab, which no longer drives anything)
> can't collide — that legacy tab is now redundant and can be removed.
> Round-trip verified live: override row → renders; partial override keeps
> defaults for unset fields; delete → defaults restored.
>
> Remaining from the "everything dynamic" brief, deliberately not started:
> theme/animation toggles, drag-and-drop page builder, scheduling/drafts/
> preview, navigation CMS, per-role permission matrix, media-driven hero
> images. Each fits the same registry pattern or needs new models — scoped
> work, not blockers.

> **2026-07-22 — Deals is a real feature now, not just a filtered view.** A
> "deal" is still just `Product.compareAtCents > priceCents` (no new table),
> but there's now a management surface for it: `/admin/deals`
> (`getAdminDeals`, `getDealCandidates` in `lib/repositories/admin.ts`;
> `setDealAction`/`endDealAction` in admin `actions.ts`, both `requireAdmin`-
> guarded). `setDealAction` rejects a fake discount — compare-at price ≤ sale
> price — before it ever reaches the database. Both actions revalidate
> `/refurbished` (`"layout"` scope) so pricing changes reach the public site
> immediately. Sidebar link added between Inventory and Coupons.
> `/refurbished/deals` redesigned to match the current white/green language:
> honest computed stats (live deal count, biggest saving, total savings —
> nothing invented), a featured "deal of the day" hero card, then the rest as
> a standard product grid.

---

## What this project is

One Next.js application serving two business divisions on **one domain, one
deployment, no subdomains**:

| Route          | What it is                                              |
| -------------- | ------------------------------------------------------- |
| `/`            | Full-screen business selection gateway (the entry point) |
| `/disposal`    | Enterprise IT asset disposal site                        |
| `/refurbished` | Refurbished electronics store (no payment gateway)       |
| `/admin`       | Protected shared admin panel for both divisions — Dashboard, Products, Categories, Brands, Orders, Customers, Disposal CMS, Blogs, Media, SEO, Settings, Analytics |

## Stack

Next.js 16.2.10 (App Router, Turbopack) · React 19.2 · TypeScript ·
Tailwind CSS v4 · Motion (Framer Motion) · Lucide · Prisma 7 · Neon Postgres.

**These versions differ from older conventions in ways that silently break
code.** See `AGENTS.md` and read `node_modules/next/dist/docs/` before writing
framework code. The short list:

- `middleware.ts` → **`proxy.ts`**, named export `middleware` → `proxy`
- `cookies()`, `headers()`, `params`, `searchParams` are **async-only**
- Tailwind v4 has **no `tailwind.config.js`** — tokens live in CSS `@theme`
- Prisma 7 needs an **explicit driver adapter**; it no longer reads
  `DATABASE_URL` implicitly

---

## Status

### Done and verified

| Area | Detail |
| --- | --- |
| Gateway | `app/page.tsx` — full-screen page (not a modal), animated backdrop, two cards with floating icons and gradient borders |
| Division redirect | `proxy.ts` — cookie-driven, verified across 5 cases incl. tampered cookie |
| Design system | `app/globals.css` — light/dark tokens, per-division accents via `[data-division]` |
| Shared shell | Header (with Switch Business + theme toggle), footer, mobile nav |
| Disposal home | Hero, stats, why-choose-us, services, industries, closing CTA |
| Disposal pages | `/services`, `/services/[slug]` (SSG, 7 pages), `/process` (scroll-linked timeline), `/industries`, `/certificates`, `/faqs` (accordion + FAQPage JSON-LD), `/contact` |
| Contact form | React Hook Form + Zod 4, Server Action writing `ContactSubmission` to Neon |
| Store — catalog data | 21 products across 8 categories, 8 brands, specs, reviews with rating aggregates — `prisma/catalog.ts` + `prisma/seed.ts` |
| Store — home | Hero, featured, categories, best sellers, deals strip, brands, why-refurbished, reviews, FAQ accordion, newsletter (UI only) |
| Store — browsing | `/shop` (filters + sort + pagination), `/categories`, `/categories/[slug]`, `/brands`, `/brands/[slug]`, `/deals`, `/search` (instant search dropdown + results page) |
| Store — product detail | `/products/[slug]` (SSG, 21 pages) — gallery with hover-zoom, specs table, condition report, reviews, related products, JSON-LD |
| Store — cart & checkout | Zustand-persisted cart/wishlist/compare (slugs + quantities only), `/cart`, 4-step `/checkout` wizard, Server Action recomputing every price from Neon before creating an `Order` |
| Store — wishlist | `/wishlist` — move to cart, remove, share (Web Share API + clipboard fallback) |
| Store header | Sticky nav with instant search, cart/wishlist badges, mobile menu |
| Shared UI | Button/ButtonLink (cva), Accordion, Breadcrumbs, PageHeader, Section, FadeIn, Toast/Toaster, 404 |
| Data layer | Full Prisma schema (31 models incl. `Review`), 2 migrations, seed script |
| Database | Neon Postgres — both migrations applied, seeded, verified |
| SEO | Per-route metadata, `sitemap.xml`, `robots.txt`, FAQ + Product JSON-LD |

Verified end-to-end, not just built:
- A value changed directly in Postgres appeared in rendered HTML at `/disposal`
  (Postgres → adapter → repository → Server Component → HTML).
- Every store route returns 200 (11 disposal + 20 store routes checked).
- **Filters and search were checked against ground-truth Neon query counts**,
  not just "the page loads": `brand=dell` → 5 (exact match to `groupBy`),
  `brand=dell&brand=apple` → 7 (5+2, OR-across-values confirmed), `maxPrice`
  → 9 (exact), category scoping and full-text search each matched a direct
  Prisma count.
- Contact and checkout schemas were exercised directly: invalid input
  rejected, valid input written to Neon, then cleaned up.

> Not yet exercised: the checkout Server Action end-to-end from a real browser
> click (place an order, confirm the `Order` + `OrderItem` rows), and the
> Server Actions generally over HTTP rather than called directly.

### Not built yet

**Disposal site:** case studies · testimonials section on the home page · blog ·
`/about`

**Store:** account area (`/account`, addresses, orders, settings, recently
viewed) · product comparison page (state exists in the Zustand store; no `/compare`
UI yet) · auth UI (login/register/forgot-password/OTP) · order success is
inline on `/checkout`, not a separate route

**Admin:** entire panel — dashboard, disposal CMS, products, categories,
orders, customers, media library, SEO, blogs, settings, analytics

**Shared:** loading states (`loading.tsx`) · pricing cards

**Cross-cutting:** auth (Auth.js) · media uploads (product images are
placeholder gradients generated from category + slug — see
`components/store/product-thumb.tsx` — no real photography or `ProductImage`
rows yet)

---

## Conventions

Follow these rather than re-deriving them:

- **Server Components by default.** Add `"use client"` only for interactivity.
- **Pages never import `lib/db` directly.** Go through `lib/repositories/*`,
  which are marked `server-only` so they can never leak into a client bundle.
- **Money is `Int` cents, never `Decimal`.** Prisma's `Decimal` is a class
  instance and throws when passed from a Server to a Client Component.
- **Icons are stored as strings**, mapped to components in `components/icon.tsx`
  — React components cannot cross the server/client boundary or be persisted.
- **Division preference is a cookie**, not localStorage, so the redirect can
  happen server-side before HTML streams. Always validate it against the
  `Division` union — an unvalidated value is an open-redirect hole.
- Brand colour swaps by division via `[data-division]`; do not fork components
  per division.
- **Cart/wishlist/compare store only slugs and quantities** (`lib/store/cart.ts`,
  Zustand + persist). Never store price in client state — a tampered
  localStorage value must not be able to change what anything costs. Prices
  are always re-resolved server-side (`app/refurbished/cart/actions.ts`) and
  recomputed again inside the checkout Server Action before an `Order` is
  created.
- **Client Components must not import `lib/repositories/*`.** Those modules
  are `server-only` and pull in Prisma + `pg`; importing one from a Client
  Component silently bundles the database driver into client JS and breaks
  the Turbopack build with an opaque chunking error. Shared constants used by
  both server and client code (e.g. sort options) live in `lib/store/*`
  instead — see `lib/store/sort.ts`. If a build error mentions `pg` or
  `@prisma/adapter-pg` inside a `[Client Component Browser]` trace, this is
  almost certainly the cause.
- Product imagery is a deterministic placeholder (gradient + SVG glyph keyed
  by category and slug), not real photography — see
  `components/store/product-thumb.tsx`. Swap for `<Image>` once `ProductImage`
  rows carry real URLs; the component signature is designed to make that a
  local change.

---

## Running it

```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint

npm run db:migrate   # prisma migrate deploy  (applies prisma/migrations)
npm run db:seed      # populate content
npm run db:studio    # browse the data
```

`.env` is gitignored; copy `.env.example` and fill in `DATABASE_URL`.

> **Credential note:** the Neon password currently in `.env` was pasted into a
> chat transcript and should be rotated in the Neon console.

If you ever fall back to the local `npx prisma dev` server, its migration engine
does not work — use `npm run db:push` instead of `db:migrate` there.
