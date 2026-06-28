"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";

const LOCATIONS = ["header", "footer_shop", "footer_company"];

function revalidate() {
  // header + footer live in the store layout, so refresh the whole tree
  revalidatePath("/", "layout");
  revalidatePath("/admin/navigation");
}

export async function addNavLink(formData: FormData) {
  await requireOwner();
  const location = String(formData.get("location") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();
  if (!LOCATIONS.includes(location) || !label || !href) return;
  const count = await prisma.navLink.count({ where: { location } });
  await prisma.navLink.create({
    data: {
      location,
      label,
      href,
      mega: formData.get("mega") === "on",
      enabled: true,
      sortOrder: count,
    },
  });
  revalidate();
}

export async function updateNavLink(id: string, formData: FormData) {
  await requireOwner();
  const label = String(formData.get("label") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();
  if (!label || !href) return;
  await prisma.navLink.update({
    where: { id },
    data: {
      label,
      href,
      mega: formData.get("mega") === "on",
      enabled: formData.get("enabled") === "on",
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    },
  });
  revalidate();
}

export async function deleteNavLink(id: string) {
  await requireOwner();
  await prisma.navLink.delete({ where: { id } });
  revalidate();
}
