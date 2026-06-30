"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";

function revalidate() {
  revalidatePath("/admin/stockists");
  revalidatePath("/"); // homepage "Also available at"
  revalidatePath("/stores");
}

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    color: String(formData.get("color") ?? "#3c6326").trim() || "#3c6326",
    url: String(formData.get("url") ?? "").trim(),
    active: formData.get("active") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function addStockist(formData: FormData) {
  await requireOwner();
  const data = parse(formData);
  if (!data.name) return;
  await prisma.stockist.create({
    data: { ...data, logoUrl: String(formData.get("logoUrl") ?? "").trim() },
  });
  revalidate();
}

export async function updateStockist(id: string, formData: FormData) {
  await requireOwner();
  const data = parse(formData);
  if (!data.name) return;
  // only replace the logo when a new one was uploaded
  const newLogo = String(formData.get("logoUrl") ?? "").trim();
  await prisma.stockist.update({
    where: { id },
    data: { ...data, ...(newLogo ? { logoUrl: newLogo } : {}) },
  });
  revalidate();
}

export async function deleteStockist(id: string) {
  await requireOwner();
  await prisma.stockist.delete({ where: { id } });
  revalidate();
}
