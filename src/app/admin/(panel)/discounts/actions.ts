"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";

function parseConditions(formData: FormData) {
  const type = String(formData.get("type") ?? "percentage");
  const rawValue = Math.max(0, Number(formData.get("value") ?? 0) || 0);
  // A percentage over 100 would make the discount exceed the subtotal and drive
  // the order total negative, so cap it. Fixed amounts stay uncapped (clamped
  // to the subtotal at checkout).
  const value = type === "percentage" ? Math.min(100, rawValue) : rawValue;
  const minSubtotal = Math.max(0, Number(formData.get("minSubtotal") ?? 0) || 0);
  const limitRaw = String(formData.get("usageLimit") ?? "").trim();
  const usageLimit = limitRaw ? Number(limitRaw) || null : null;
  const endsRaw = String(formData.get("endsAt") ?? "").trim();
  const endsAt = endsRaw ? new Date(endsRaw + "T23:59:59") : null;
  const active = formData.get("active") === "on";
  return { type, value, minSubtotal, usageLimit, endsAt, active };
}

export async function createDiscount(formData: FormData) {
  await requireOwner();
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
  await requireOwner();
  const c = parseConditions(formData);
  await prisma.discount.update({ where: { id }, data: c });
  revalidatePath("/admin/discounts");
}

export async function toggleDiscount(id: string, active: boolean) {
  await requireOwner();
  await prisma.discount.update({ where: { id }, data: { active } });
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(id: string) {
  await requireOwner();
  await prisma.discount.delete({ where: { id } });
  revalidatePath("/admin/discounts");
}
