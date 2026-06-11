# Integration Guide — Eco Global Foods

How to take the structured stubs to production. Every integration follows the
same shape: **set environment variables → complete the marked TODO → test in
sandbox → go live.** Copy `.env.example` to `.env` and fill values as you go.

---

## 1. Database → Postgres (production)

Local dev uses SQLite. For production:

1. In `prisma/schema.prisma`, change `datasource db { provider = "sqlite" }`
   to `provider = "postgresql"`.
2. Set `DATABASE_URL` to your Postgres connection string.
3. Run `npx prisma migrate deploy` then `npm run db:seed` (one-time, to import
   the catalogue + settings).

The schema is already Postgres-portable (no SQLite-only types).

---

## 2. Payments

The checkout creates the order as **`pending`** for every method. COD and bank
transfer stay pending until you reconcile them in the admin (mark as paid). The
three gateways use a redirect + callback flow.

**Files**
- `src/lib/payments.ts` — method metadata + enable/disable (also toggled in admin → Settings).
- `src/lib/payments-gateway.ts` — `initiatePayment()` (build redirect) and `verifyCallback()` (verify signature). **Complete the TODOs here.**
- `src/app/api/payments/[provider]/callback/route.ts` — receives the gateway callback, verifies it, marks the order paid, redirects to `/order/[number]`.

**To finish a gateway (e.g. JazzCash)**
1. Get merchant credentials; set `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, `JAZZCASH_INTEGRITY_SALT`, `JAZZCASH_MODE`.
2. In `initiatePayment()` → `case "jazzcash"`: build the `pp_*` parameters, compute the `pp_SecureHash` (HMAC-SHA256 with the integrity salt), and return `{ kind: "redirect", url }`.
3. In `verifyCallback()` → `case "jazzcash"`: recompute the secure hash from the returned params and compare.
4. In the checkout flow, after `placeOrder` succeeds for a redirect method, send the customer to the `initiatePayment` URL instead of straight to `/order/[number]`. (COD/bank keep the current direct flow.)
5. Set the gateway's return URL to `…/api/payments/jazzcash/callback?orderNumber=<n>`.

Easypaisa and card follow the same pattern (their `case` blocks + env keys).

---

## 3. Shipping → ZoomCOD

**File:** `src/lib/shipping.ts` (the `zoomCod` adapter).

1. Set `ZOOMCOD_API_KEY`, `ZOOMCOD_API_BASE`, `ZOOMCOD_PICKUP_ADDRESS_ID`.
2. When the key is present, `bookShipment()` already POSTs to the booking API —
   confirm the exact request/response field names against ZoomCOD's docs and
   adjust the body + `tracking_number` mapping.
3. Admins book a shipment from the order detail page ("Book with ZoomCOD"),
   which calls this adapter and stamps the courier + tracking number.

To add another courier later, implement the `ShippingProvider` interface and add
it to `shippingProviders` — no caller changes needed.

---

## 4. Product images & uploads ✅ implemented

The product editor's **Media** panel supports **drag/click file uploads** (and
pasting URLs). Uploads go to `POST /api/admin/upload` (admin-session guarded) and
are stored via `src/lib/storage.ts`.

- **Default (`local` provider):** files are written to `public/uploads/` and
  served same-origin. Works on any Node host (VPS / self-hosted).
- **Serverless (Vercel) or scale:** the local filesystem is ephemeral. Implement
  a cloud `StorageProvider` (S3 / Cloudinary / Vercel Blob) in `storage.ts` and
  return it from `getStorage()` (e.g. when `STORAGE_DRIVER=s3`). Callers don't
  change. Add the CDN host to `images.remotePatterns` in `next.config.ts`.

Imported products still reference the live Shopify CDN (already allowed).

---

## 5. Customisable settings

Almost everything merchant-facing is editable in **admin → Settings** (store
details, social links, announcement bar, shipping thresholds, payment toggles,
footer credit). Defaults live in `src/lib/settings-defaults.ts`; overrides are
stored in the `Setting` table and read via `src/lib/settings.ts`.

---

## 6. Order confirmation email ✅ implemented

`src/lib/email.ts` sends a branded HTML order-confirmation via **Nodemailer**.
It fires automatically from `placeOrder` (checkout) and can be re-sent from the
admin order detail ("Resend email"). The customer is the recipient; the store
email (`settings.storeEmail`) is BCC'd.

- **Without SMTP:** it logs a dev-fallback line to the server console (the
  pipeline is fully wired; nothing is actually emailed).
- **To go live:** set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
  `SMTP_FROM` (and `NEXT_PUBLIC_SITE_URL` for links). That's it — real emails
  start sending.

Hook other emails (password reset, shipping updates) into the same `deliver()`.

---

## 7. Auth secrets

`AUTH_SECRET` signs both admin and customer session cookies — set a long random
value in production. Admin login is seeded as `admin@ecoglobalfoods.com` /
`ecoadmin123`; change it (and add staff) before launch.
