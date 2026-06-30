"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function parseConditions(formData: FormData) {
  const type = String(formData.get("type") ?? "percentage");
  const value = Number(formData.get("value") ?? 0) || 0;
  const minSubtotal = Number(formData.get("minSubtotal") ?? 0) || 0;
  const limitRaw = String(formData.get("usageLimit") ?? "").trim();
  const usageLimit = limitRaw ? Number(limitRaw) || null : null;
  const endsRaw = String(formData.get("endsAt") ?? "").trim();
  const endsAt = endsRaw ? new Date(endsRaw + "T23:59:59") : null;
  const active = formData.get("active") === "on";
  return { type, value, minSubtotal, usageLimit, endsAt, active };
}

export async function createDiscount(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return;
  const c = parseConditions(formData);
  await prisma.discount.upsert({
    where: { code },
    update: c,
    create: { code, ...c },
  });
  revalidatePath("/admin/discounts");
}

export async function updateDiscount(id: string, formData: FormData) {
  const c = parseConditions(formData);
  await prisma.discount.update({ where: { id }, data: c });
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
