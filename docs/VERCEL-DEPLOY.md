# Free demo deploy — Vercel + Neon (Postgres)

A free, fully-working, shareable deployment. ~20 minutes. No card required.

The app is a Next.js full-stack app; the only thing it needs externally is a
Postgres database, which Neon provides free.

---

## Step 1 — Create a free Postgres (Neon)

1. Go to **https://neon.tech** → sign up (GitHub/Google).
2. Create a project (name it `egf`). A database is created automatically.
3. On the project dashboard, copy the **connection string**. It looks like:
   `postgresql://USER:PASS@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

That single string is your `DATABASE_URL`.

## Step 2 — Create the tables + load the products (once)

This fills the database with the 123 real products, collections, reviews, etc.
Run it from the project folder with the Neon URL:

```bash
cd ecoglobalfoods
# paste your Neon string here:
export DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
npm install
npm run db:push      # creates all the tables from the schema
npm run db:seed      # imports products, collections, reviews, settings…
```

(You can also just paste the Neon string to me and I'll run this for you.)

## Step 3 — Put the code on GitHub

Vercel deploys from a Git repo.

```bash
cd ecoglobalfoods
git init && git add -A && git commit -m "Eco Global Foods"
# create an empty repo at github.com/new (e.g. egf-web), then:
git remote add origin https://github.com/<you>/egf-web.git
git branch -M main && git push -u origin main
```

## Step 4 — Deploy on Vercel

1. Go to **https://vercel.com** → sign up with GitHub → **Add New → Project**.
2. Import the `egf-web` repo.
3. **Root Directory:** set to `ecoglobalfoods` (the Next.js app lives in this
   subfolder). If you pushed from inside `ecoglobalfoods/`, leave it as the root.
4. **Environment Variables** — add these three:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | your Neon connection string |
   | `AUTH_SECRET` | any long random string |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` (set after first deploy, then redeploy) |

5. Click **Deploy**. Vercel runs `prisma generate` (via postinstall) then
   `next build` automatically.
6. You get a public URL like `https://egf-web.vercel.app` — share that.

Every `git push` afterwards auto-redeploys.

---

## Notes for the demo
- **Login to admin** at `/admin/login` with `admin@ecoglobalfoods.com` /
  `ecoadmin123` (change before anything real).
- **Emails** are not configured, so order/welcome/campaign emails log on the
  server instead of sending — fine for a demo.
- **New image uploads** in the admin won't persist (Vercel's filesystem is
  ephemeral), but all seeded products already use real image URLs, so the store
  looks complete. Add cloud storage later (see `DEPLOY-CHECKLIST.md`).
- **Custom domain:** Vercel → Project → Settings → Domains, when ready.

## Want it to actually send email on the demo?
Add `SMTP_*` env vars (Resend or Brevo free tier) — see `DEPLOY-CHECKLIST.md` §2.
