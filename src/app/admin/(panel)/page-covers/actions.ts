"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";

export async function savePageHero(pageKey: string, formData: FormData) {
  await requireOwner();
  if (!pageKey) return;
  const images = String(formData.get("images") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5)
    .join(",");
  const data = {
    mode: String(formData.get("mode") ?? "gradient") === "slider" ? "slider" : "gradient",
    gradient: String(formData.get("gradient") ?? "gradient-purple-green"),
    animated: formData.get("animated") === "on",
    images,
    autoplayMs: Math.max(2000, (Number(formData.get("autoplaySec") ?? 5) || 5) * 1000),
  };
  await prisma.pageHero.upsert({
    where: { pageKey },
    update: data,
    create: { pageKey, ...data },
  });
  // covers live in page bodies + the store layout; refresh the whole tree
  revalidatePath("/", "layout");
  revalidatePath("/admin/page-covers");
}
