# Build Progress

Living record of what exists, what is verified, and what is next. **Update this
as work lands** — it is the handover document between sessions, so it should be
accurate even when nobody remembers the conversation that produced it.

Last updated: 2026-07-22

> **2026-07-22 — repo reorganised by collaborator (prajwallshetty):** routes
> moved into groups (`app/(disposal)/disposal/…`, `app/(refurbished)/…`,
> `app/(admin)/admin/…`, `app/(auth)/…`); an admin CMS, auth (OAuth + password),
> and account area were added. The `passwordHash` field was applied with
> `db push`, so there is **no migration** for it — regenerate the client
> (`npm run db:generate`) after pulling if Prisma types look stale.

> **2026-07-22 — /disposal ITAD landing redesigned** (`components/disposal/itad/*`).
> Sections for services, process, FAQs, testimonials and compliance are driven
> by the CMS tables (edits in /admin/disposal appear without a deploy); hero,
> bento, comparison, showcase, lifecycle and CTAs are static per the approved
> spec. Palette: gray-900 / blue-600 / emerald-500 (exact spec hexes as
> Tailwind classes). The previous static landing components
> (`components/disposal/disposal-*.tsx`) are no longer rendered by the page but
> were intentionally left in the tree for comparison — delete once the redesign
> is signed off.

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
