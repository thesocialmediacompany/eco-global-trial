# Deployment checklist

Everything to set up when the site goes live. Items are ordered by priority.
All environment variables below live in `.env.example` — copy it to `.env`
(or your host's env settings) and fill them in.

---

## 1. Must-do (the site won't work correctly without these)

- [ ] **Database → Postgres.** The schema now uses `provider = "postgresql"`.
      Set `DATABASE_URL` to your Postgres connection string (Neon/Supabase/Vercel
      Postgres) and run `npm run db:push` to create the tables, then
      `npm run db:seed` once to populate the 123 real products. (The old
      `prisma/migrations/` are SQLite-era and unused; regenerate Postgres
      migrations later with `prisma migrate dev` if you want migration history.)
      A full free-deploy walkthrough is in `docs/VERCEL-DEPLOY.md`.
- [ ] **`AUTH_SECRET`** — set a long random string (admin + customer sessions).
- [ ] **Change the admin password.** Seed default is
      `admin@ecoglobalfoods.com` / `ecoadmin123`. Log in → Settings → Staff, or
      reseed with a new hash. Do NOT ship the default.
- [ ] **`NEXT_PUBLIC_SITE_URL`** = the real domain (e.g.
      `https://www.ecoglobalfoods.com`). Used in emails, OG tags, sitemap,
      unsubscribe links.

## 2. Email (transactional + newsletter campaigns)

Until SMTP is set, all emails only log to the server (`would send: …`). Once
set, order confirmations, shipping/tracking, password reset, welcome, abandoned
cart, review requests, AND newsletter campaigns all deliver with no code change.

- [ ] **`SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM`.**
      Recommended providers: **Resend** or **Brevo** (both have free tiers and
      give you these values). `SMTP_FROM` should be a real address on the domain,
      e.g. `Eco Global Foods <hello@ecoglobalfoods.com>`.
- [ ] **Authenticate the domain** so mail doesn't land in spam: add the
      **SPF**, **DKIM**, and **DMARC** DNS records your provider gives you for
      `ecoglobalfoods.com`. This matters most for newsletter campaigns.
- [ ] After deploy: in admin → **Campaigns**, use **"Send test"** to yourself to
      confirm real delivery before any broadcast.

## 3. Uploads (only if hosting serverless, e.g. Vercel)

- [ ] Product image uploads write to `public/uploads/`, which is **wiped on each
      deploy** on serverless hosts. Switch `src/lib/storage.ts` to a cloud
      provider (S3 / Cloudinary). Not needed on a normal VPS/server with a
      persistent disk.

## 4. Payments & courier (COD + bank transfer already work)

- [ ] **JazzCash / Easypaisa / Card** are stubs awaiting merchant credentials +
      signing — fill the `JAZZCASH_* / EASYPAISA_* / CARD_GATEWAY_*` vars and
      complete the signing in `src/lib/payments-gateway.ts`. COD and bank
      transfer need nothing.
- [ ] **ZoomCOD** — set `ZOOMCOD_API_KEY`, `ZOOMCOD_API_BASE`,
      `ZOOMCOD_PICKUP_ADDRESS_ID`, and confirm the booking field names in
      `src/lib/shipping.ts` against ZoomCOD's API docs.

## 5. Marketing & branding

- [ ] **Analytics:** in admin → Settings, add the **GA4 Measurement ID** and
      **Meta Pixel ID** (blank = off). Events (page view, add-to-cart, purchase)
      fire automatically once set.
- [ ] **Official logos:** drop the real Eco Global Foods logo at
      `public/brand/logo-mark.svg`, and licensed stockist logos in
      `public/stores/<slug>.{svg,png,webp,jpg}` (see `public/stores/README.md`).
      Until then a clean placeholder mark + styled store names show.
- [ ] **Welcome discount:** the newsletter promises "20% off your first order" —
      make sure a matching code exists in admin → Discounts (WELCOME20 is seeded).

## 6. Optional / post-launch

- [ ] **Subscribe & Save reminders** are captured but not auto-sent — add a daily
      cron that emails due reorder reminders (model `ReorderReminder`).
- [ ] Rate-limiting on contact/login forms (newsletter already has a honeypot).
- [ ] Automated tests for shipping / discount / inventory math.

---

### Quick smoke test after deploy
1. Place a COD order end-to-end → confirmation email arrives, stock decrements.
2. Admin: mark fulfilled / book ZoomCOD → shipping email arrives.
3. Newsletter: subscribe from footer → welcome email; send a test campaign.
4. Track an order at `/track`; unsubscribe via an email link.
