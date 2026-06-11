"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function deleteSubscriber(id: string) {
  await prisma.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/admin/subscribers");
}

export async function toggleSubscriber(id: string) {
  const sub = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!sub) return;
  await prisma.newsletterSubscriber.update({
    where: { id },
    data: { active: !sub.active },
  });
  revalidatePath("/admin/subscribers");
}
