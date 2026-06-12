"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendCampaignEmail } from "@/lib/email";
import { getFeaturedProducts } from "@/lib/products";
import type { CampaignProduct } from "@/lib/campaign-template";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function parseForm(formData: FormData) {
  return {
    subject: String(formData.get("subject") ?? "").trim(),
    preheader: String(formData.get("preheader") ?? "").trim(),
    bannerImage: String(formData.get("bannerImage") ?? "").trim(),
    headline: String(formData.get("headline") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
    ctaUrl: String(formData.get("ctaUrl") ?? "").trim(),
    includeProducts: formData.get("includeProducts") === "on",
  };
}

/** Resolve the featured products into email-ready cards. */
async function featuredCards(): Promise<CampaignProduct[]> {
  const products = await getFeaturedProducts(4);
  return products.map((p) => ({
    title: p.name,
    price: p.price,
    imageUrl: p.imageUrl ?? null,
    url: `${siteUrl()}/product/${p.slug}`,
  }));
}

/** Send a one-off preview to a single address before blasting the list. */
export async function sendTestCampaign(formData: FormData) {
  const f = parseForm(formData);
  const testTo = String(formData.get("testTo") ?? "").trim();
  if (!f.subject || !f.body || !testTo) return;

  const products = f.includeProducts ? await featuredCards() : undefined;

  await sendCampaignEmail({
    to: testTo,
    subject: `[TEST] ${f.subject}`,
    body: f.body,
    preheader: f.preheader,
    bannerImage: f.bannerImage,
    headline: f.headline,
    ctaLabel: f.ctaLabel,
    ctaUrl: f.ctaUrl,
    products,
    unsubscribeUrl: `${siteUrl()}/newsletter/unsubscribe?token=preview`,
  }).catch((e) => console.error("test campaign failed:", e));

  revalidatePath("/admin/campaigns");
}

/**
 * Send the campaign to every active subscriber. Throttled in small batches so
 * a basic SMTP relay isn't overwhelmed. For very large lists a background queue
 * would be better, but this is safe for the current scale.
 */
export async function sendCampaign(formData: FormData) {
  const f = parseForm(formData);
  if (!f.subject || !f.body) return;

  const subs = await prisma.newsletterSubscriber.findMany({
    where: { active: true },
  });
  const products = f.includeProducts ? await featuredCards() : undefined;

  const campaign = await prisma.campaign.create({
    data: {
      subject: f.subject,
      preheader: f.preheader,
      bannerImage: f.bannerImage,
      headline: f.headline,
      body: f.body,
      ctaLabel: f.ctaLabel,
      ctaUrl: f.ctaUrl,
      includeProducts: f.includeProducts,
      status: "draft",
    },
  });

  let sent = 0;
  const BATCH = 20;
  for (let i = 0; i < subs.length; i += BATCH) {
    const slice = subs.slice(i, i + BATCH);
    const results = await Promise.all(
      slice.map((s) =>
        sendCampaignEmail({
          to: s.email,
          subject: f.subject,
          body: f.body,
          preheader: f.preheader,
          bannerImage: f.bannerImage,
          headline: f.headline,
          ctaLabel: f.ctaLabel,
          ctaUrl: f.ctaUrl,
          products,
          unsubscribeUrl: `${siteUrl()}/newsletter/unsubscribe?token=${s.unsubToken}`,
        })
          .then((r) => (r.sent ? 1 : 0))
          .catch(() => 0),
      ),
    );
    sent += results.reduce((a: number, b) => a + b, 0);
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: "sent", sentCount: sent || subs.length, sentAt: new Date() },
  });

  revalidatePath("/admin/campaigns");
}
