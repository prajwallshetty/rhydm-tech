# Build Progress

Living record of what exists, what is verified, and what is next. **Update this
as work lands** — it is the handover document between sessions, so it should be
accurate even when nobody remembers the conversation that produced it.

Last updated: 2026-07-21

---

## What this project is

One Next.js application serving two business divisions on **one domain, one
deployment, no subdomains**:

| Route          | What it is                                              |
| -------------- | ------------------------------------------------------- |
| `/`            | Full-screen business selection gateway (the entry point) |
| `/disposal`    | Enterprise IT asset disposal site                        |
| `/refurbished` | Refurbished electronics store (no payment gateway)       |
| `/admin`       | Shared admin panel for both divisions — not built yet    |

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
| Store home | Hero, categories, why-refurbished |
| Shared UI | Button/ButtonLink (cva), Accordion, Breadcrumbs, PageHeader, Section, FadeIn, 404 |
| Data layer | Full Prisma schema (29 models), baseline migration, seed script |
| Database | Neon Postgres — `migrate deploy` applied, seeded, verified |
| SEO | Per-route metadata, `sitemap.xml`, `robots.txt`, FAQ structured data |

Verified end-to-end: a value changed directly in Postgres appeared in the
rendered HTML at `/disposal`, confirming the full path
Postgres → Prisma adapter → repository → Server Component → HTML. All 11 routes
return the expected status (including 404), DB-sourced content was confirmed
present in the HTML, and the contact schema + write path were exercised against
Neon (invalid input rejected, valid row written, then cleaned up).

> Not yet exercised: the Server Action over HTTP from a real browser. The
> validation and the database write it performs were tested directly; the thin
> action wrapper around them was not.

### Not built yet

**Disposal site:** case studies · testimonials section on the home page · blog ·
`/about`

**Store:** product listing + filters · product detail + gallery · category
pages · wishlist · cart · checkout UI · order success · profile · orders ·
search · comparison · recently viewed

**Admin:** entire panel — dashboard, disposal CMS, products, categories,
orders, customers, media library, SEO, blogs, settings, analytics

**Shared:** pagination · empty states · loading states (`loading.tsx`) ·
pricing cards · search

**Cross-cutting:** auth (Auth.js) · media uploads · products are modelled in the
schema but no product rows are seeded yet

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
