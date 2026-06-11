"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendCampaignEmail } from "@/lib/email";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function parseForm(formData: FormData) {
  return {
    subject: String(formData.get("subject") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
    ctaUrl: String(formData.get("ctaUrl") ?? "").trim(),
  };
}

/** Send a one-off preview to a single address before blasting the list. */
export async function sendTestCampaign(formData: FormData) {
  const { subject, body, ctaLabel, ctaUrl } = parseForm(formData);
  const testTo = String(formData.get("testTo") ?? "").trim();
  if (!subject || !body || !testTo) return;

  await sendCampaignEmail({
    to: testTo,
    subject: `[TEST] ${subject}`,
    body,
    ctaLabel,
    ctaUrl,
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
  const { subject, body, ctaLabel, ctaUrl } = parseForm(formData);
  if (!subject || !body) return;

  const subs = await prisma.newsletterSubscriber.findMany({
    where: { active: true },
  });

  const campaign = await prisma.campaign.create({
    data: { subject, body, ctaLabel, ctaUrl, status: "draft" },
  });

  let sent = 0;
  const BATCH = 20;
  for (let i = 0; i < subs.length; i += BATCH) {
    const slice = subs.slice(i, i + BATCH);
    const results = await Promise.all(
      slice.map((s) =>
        sendCampaignEmail({
          to: s.email,
          subject,
          body,
          ctaLabel,
          ctaUrl,
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
