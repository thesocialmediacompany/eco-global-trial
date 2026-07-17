"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { ABOUT_GRIDS } from "@/lib/about-icons";

const GRID_KEYS = ABOUT_GRIDS.map((g) => g.key) as string[];

function refresh() {
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

/** Add an item to a grid, appended at the end. */
export async function createAboutItem(formData: FormData) {
  await requireOwner();
  const grid = String(formData.get("grid") ?? "");
  if (!GRID_KEYS.includes(grid)) return;
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const last = await prisma.aboutItem.findFirst({
    where: { grid },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.aboutItem.create({
    data: {
      grid,
      title,
      body: String(formData.get("body") ?? "").trim(),
      icon: String(formData.get("icon") ?? "").trim(),
      year: String(formData.get("year") ?? "").trim(),
      sortOrder: (last?.sortOrder ?? -1) + 1,
      active: true,
    },
  });
  refresh();
}

/** Update one item. */
export async function updateAboutItem(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.aboutItem.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? "").trim(),
      body: String(formData.get("body") ?? "").trim(),
      icon: String(formData.get("icon") ?? "").trim(),
      year: String(formData.get("year") ?? "").trim(),
      active: formData.get("active") === "on",
    },
  });
  refresh();
}

export async function deleteAboutItem(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.aboutItem.delete({ where: { id } });
  refresh();
}

/** Move an item up or down within its grid by swapping sortOrder. */
export async function moveAboutItem(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "");
  if (!id || (dir !== "up" && dir !== "down")) return;

  const item = await prisma.aboutItem.findUnique({ where: { id } });
  if (!item) return;

  const neighbour = await prisma.aboutItem.findFirst({
    where:
      dir === "up"
        ? { grid: item.grid, sortOrder: { lt: item.sortOrder } }
        : { grid: item.grid, sortOrder: { gt: item.sortOrder } },
    orderBy: { sortOrder: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.aboutItem.update({ where: { id: item.id }, data: { sortOrder: neighbour.sortOrder } }),
    prisma.aboutItem.update({ where: { id: neighbour.id }, data: { sortOrder: item.sortOrder } }),
  ]);
  refresh();
}
