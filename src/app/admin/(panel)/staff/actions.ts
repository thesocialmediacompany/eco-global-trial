"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function addStaff(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "staff");
  const password = String(formData.get("password") ?? "");
  if (!email || !name || password.length < 6) return;

  const exists = await prisma.staffUser.findUnique({ where: { email } });
  if (exists) return;

  await prisma.staffUser.create({
    data: { email, name, role, passwordHash: await bcrypt.hash(password, 10) },
  });
  revalidatePath("/admin/staff");
}

export async function updateStaffRole(id: string, formData: FormData) {
  const role = String(formData.get("role") ?? "staff");
  await prisma.staffUser.update({ where: { id }, data: { role } });
  revalidatePath("/admin/staff");
}

export async function resetStaffPassword(id: string, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return;
  await prisma.staffUser.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  revalidatePath("/admin/staff");
}

export async function deleteStaff(id: string) {
  const count = await prisma.staffUser.count();
  if (count <= 1) return; // never remove the last account
  await prisma.staffUser.delete({ where: { id } });
  revalidatePath("/admin/staff");
}
