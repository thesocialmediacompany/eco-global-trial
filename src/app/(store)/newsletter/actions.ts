"use server";

import { prisma } from "@/lib/prisma";
import { sendNewsletterWelcome } from "@/lib/email";

export type NewsletterState = { ok?: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Subscribe an email to the newsletter. Idempotent + re-activates opt-outs. */
export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = String(formData.get("source") ?? "footer");
  // Honeypot: bots fill hidden fields; humans leave them empty.
  if (String(formData.get("company") ?? "")) return { ok: true };
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    if (!existing.active) {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { active: true },
      });
    }
    return { ok: true };
  }

  await prisma.newsletterSubscriber.create({
    data: { email, source },
  });

  // Welcome email (never block the signup on email failure).
  try {
    await sendNewsletterWelcome(email);
  } catch (e) {
    console.error("newsletter welcome email failed:", e);
  }

  return { ok: true };
}
