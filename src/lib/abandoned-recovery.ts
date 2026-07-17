import "server-only";
import { prisma } from "@/lib/prisma";
import { sendAbandonedRecovery } from "@/lib/email";
import { LOOKS_LIKE_EMAIL } from "@/lib/utils";

/**
 * The abandoned-checkout follow-up sequence.
 *
 * Two nudges: one an hour after the cart was abandoned, while intent is still
 * warm, and one the next day. Nothing after that, so a shopper who ignores
 * both is left alone.
 */
export const FIRST_NUDGE_AFTER_MS = 60 * 60 * 1000; // 1 hour
export const SECOND_NUDGE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Carts older than this are past saving, and mailing them risks spam
 * complaints against a domain we need for order confirmations.
 */
export const GIVE_UP_AFTER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Nothing to sell back to someone whose cart is empty. */
const MIN_SUBTOTAL = 1;

export interface SweepResult {
  considered: number;
  sent: number;
  failed: number;
  skipped: number;
  details: string[];
}

/**
 * Send whichever nudge each open cart is due, and record that it went.
 *
 * Safe to run repeatedly: which nudge a cart is due for is derived from
 * recoveryCount and its age, so a double-run in the same hour re-sends
 * nothing. That matters because a cron can and will fire twice.
 */
export async function runAbandonedRecoverySweep(now = new Date()): Promise<SweepResult> {
  const result: SweepResult = { considered: 0, sent: 0, failed: 0, skipped: 0, details: [] };

  const open = await prisma.abandonedCheckout.findMany({
    where: { recovered: false, recoveryCount: { lt: 2 }, subtotal: { gte: MIN_SUBTOTAL } },
    orderBy: { createdAt: "asc" },
  });

  for (const cart of open) {
    result.considered++;
    const age = now.getTime() - cart.createdAt.getTime();

    // A malformed address can't be mailed. It only exists because an older
    // build captured carts mid-typing; leave it for staff to clear.
    if (!LOOKS_LIKE_EMAIL.test(cart.email)) {
      result.skipped++;
      result.details.push(`skip ${cart.email}: not a usable address`);
      continue;
    }

    if (age > GIVE_UP_AFTER_MS) {
      result.skipped++;
      result.details.push(`skip ${cart.email}: abandoned ${Math.round(age / 86400000)}d ago`);
      continue;
    }

    const due =
      cart.recoveryCount === 0 && age >= FIRST_NUDGE_AFTER_MS
        ? 1
        : cart.recoveryCount === 1 && age >= SECOND_NUDGE_AFTER_MS
          ? 2
          : 0;

    if (due === 0) {
      result.skipped++;
      continue;
    }

    const send = await sendAbandonedRecovery(cart.id, due as 1 | 2).catch((e) => {
      console.error("[abandoned-recovery] send threw:", e);
      return { sent: false as const, reason: "threw" };
    });

    if (send.sent) {
      // Only count a nudge that actually left, so a mail outage means a delayed
      // nudge on the next run rather than a silently skipped one.
      await prisma.abandonedCheckout.update({
        where: { id: cart.id },
        data: { recoveryCount: due, recoveryEmailSentAt: now },
      });
      result.sent++;
      result.details.push(`sent nudge ${due} to ${cart.email}`);
    } else {
      result.failed++;
      result.details.push(
        `FAILED nudge ${due} to ${cart.email}: ${"reason" in send ? send.reason : "unknown"}`,
      );
    }
  }

  return result;
}
