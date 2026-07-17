"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendAbandonedRecovery } from "@/lib/email";

export async function deleteAbandoned(id: string) {
  await prisma.abandonedCheckout.delete({ where: { id } });
  revalidatePath("/admin/abandoned");
}

export async function markRecovered(id: string) {
  await prisma.abandonedCheckout.update({ where: { id }, data: { recovered: true } });
  revalidatePath("/admin/abandoned");
}

/**
 * Send the next nudge now rather than waiting for the schedule.
 *
 * Advances recoveryCount exactly as the automatic sweep would, so a nudge sent
 * by hand isn't repeated an hour later by the cron.
 */
export async function sendRecoveryEmail(id: string) {
  const cart = await prisma.abandonedCheckout.findUnique({ where: { id } });
  if (!cart || cart.recovered) return;

  const stage = cart.recoveryCount === 0 ? 1 : 2;

  const result = await sendAbandonedRecovery(id, stage).catch((e) => {
    console.error("recovery email failed:", e);
    return { sent: false } as const;
  });

  if (result.sent) {
    await prisma.abandonedCheckout.update({
      where: { id },
      data: { recoveryCount: stage, recoveryEmailSentAt: new Date() },
    });
  }
  revalidatePath("/admin/abandoned");
}
