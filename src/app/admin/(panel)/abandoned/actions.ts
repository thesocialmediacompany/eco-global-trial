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

/** Email the shopper a recovery nudge and stamp when it was sent. */
export async function sendRecoveryEmail(id: string) {
  const result = await sendAbandonedRecovery(id).catch((e) => {
    console.error("recovery email failed:", e);
    return { sent: false } as const;
  });
  if (result.sent) {
    await prisma.abandonedCheckout.update({
      where: { id },
      data: { recoveryEmailSentAt: new Date() },
    });
  }
  revalidatePath("/admin/abandoned");
}
