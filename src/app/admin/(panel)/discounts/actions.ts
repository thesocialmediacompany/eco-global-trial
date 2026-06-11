"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createDiscount(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return;
  const type = String(formData.get("type") ?? "percentage");
  const value = Number(formData.get("value") ?? 0) || 0;
  const minSubtotal = Number(formData.get("minSubtotal") ?? 0) || 0;

  await prisma.discount.upsert({
    where: { code },
    update: { type, value, minSubtotal, active: true },
    create: { code, type, value, minSubtotal, active: true },
  });
  revalidatePath("/admin/discounts");
}

export async function toggleDiscount(id: string, active: boolean) {
  await prisma.discount.update({ where: { id }, data: { active } });
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(id: string) {
  await prisma.discount.delete({ where: { id } });
  revalidatePath("/admin/discounts");
}
