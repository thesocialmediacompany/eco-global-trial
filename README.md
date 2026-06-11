# Eco Global Foods — Custom E-commerce Website

A custom, highly-animated storefront **and** Shopify-style admin backend for
[Eco Global Foods (SMC-PVT) Ltd.](https://www.ecoglobalfoods.com) — built with
Next.js 15, TypeScript, Tailwind v4, Framer Motion and Prisma.

Premium **purple + green** theme (deep aubergine `#3b1538` + forest green `#233f18`).

## Getting started

```bash
npm install
npm run db:seed      # create + seed the local SQLite database
npm run dev          # http://localhost:3000
```

- **Storefront:** http://localhost:3000
- **Admin:** http://localhost:3000/admin → login **admin@ecoglobalfoods.com** / **ecoadmin123**

Other scripts: `npm run build` (production build), `npm run db:studio`
(browse the database), `npm run db:seed` (reset to clean demo data).

## What's included

### Storefront (`src/app/(store)`)
- Animated home (hero, value ticker, featured products, categories, story, why-us, newsletter)
- Product detail (`/product/[slug]`) with flavour/variant selector, add-to-cart, related items, Product JSON-LD
- Category (`/category/[slug]`), Shop (`/shop`), Search (`/search`)
- Cart drawer + cart page, **checkout** with COD / JazzCash / Easypaisa / card / bank, order confirmation (`/order/[number]`)
- About, Contact (form), FAQ, Account/track-order, Policies (privacy/terms/shipping/refund)
- Blog list + post pages (`/blog`)
- Per-page SEO metadata, dynamic `sitemap.xml`, `robots.txt`, JSON-LD

### Admin (`src/app/admin`) — Shopify-style, EGF-branded
- Email/password auth (bcrypt + JWT cookie) with route-protecting middleware
- Dashboard, **Orders** (metric bar, tabs, filters, CSV export, Create order, order detail with fulfil/paid/ZoomCOD booking)
- **Products** (list + full editor: variants, pricing, organization, per-product SEO listing)
- **Content** (blog CRUD), **Customers**, **Discounts** (CRUD), **Analytics** (live), **Settings**

## Architecture notes

- **Database:** Prisma. Local dev uses **SQLite** (`prisma/dev.db`, zero-config).
  For production, change `datasource.provider` to `postgresql` in
  `prisma/schema.prisma` and set `DATABASE_URL` — the schema is Postgres-portable.
- **Payments** (`src/lib/payments.ts`): COD + bank transfer work today; JazzCash,
  Easypaisa and card are structured stubs awaiting merchant credentials/redirect flows.
- **Shipping** (`src/lib/shipping.ts`): pluggable courier layer with a **ZoomCOD**
  adapter — replace the stub in `bookShipment()` with the real ZoomCOD API call.
- **Env:** `DATABASE_URL` and `AUTH_SECRET` (change `AUTH_SECRET` in production).

## Not yet wired (next steps)
- Real payment gateway callbacks (JazzCash/Easypaisa/card) and ZoomCOD API.
- Product image uploads (currently emoji pack-art).
- Customer accounts with login/saved orders (storefront `/account` tracks by order #).
