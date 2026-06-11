"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

/** Create a new weight-based shipping band. */
export async function createShippingRate(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim() || "New rate";
  const minGrams = Math.max(0, num(formData.get("minGrams")));
  const maxRaw = String(formData.get("maxGrams") ?? "").trim();
  const maxGrams = maxRaw === "" ? null : Math.max(0, num(formData.get("maxGrams")));
  const rate = Math.max(0, num(formData.get("rate")));

  const last = await prisma.shippingRate.findFirst({
    orderBy: { sortOrder: "desc" },
  });

  await prisma.shippingRate.create({
    data: {
      label,
      minGrams,
      maxGrams,
      rate,
      sortOrder: (last?.sortOrder ?? -1) + 1,
      active: true,
    },
  });

  revalidatePath("/admin/shipping");
}

/** Update an existing band. */
export async function updateShippingRate(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const label = String(formData.get("label") ?? "").trim() || "Rate";
  const minGrams = Math.max(0, num(formData.get("minGrams")));
  const maxRaw = String(formData.get("maxGrams") ?? "").trim();
  const maxGrams = maxRaw === "" ? null : Math.max(0, num(formData.get("maxGrams")));
  const rate = Math.max(0, num(formData.get("rate")));
  const active = formData.get("active") === "on";

  await prisma.shippingRate.update({
    where: { id },
    data: { label, minGrams, maxGrams, rate, active },
  });

  revalidatePath("/admin/shipping");
}

/** Delete a band. */
export async function deleteShippingRate(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.shippingRate.delete({ where: { id } });
  revalidatePath("/admin/shipping");
}
