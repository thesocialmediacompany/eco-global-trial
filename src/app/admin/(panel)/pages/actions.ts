"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";

function revalidateFaq() {
  revalidatePath("/admin/pages");
  revalidatePath("/faq");
}

export async function addFaq(formData: FormData) {
  await requireOwner();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return;
  const count = await prisma.faqItem.count();
  await prisma.faqItem.create({ data: { question, answer, sortOrder: count } });
  revalidateFaq();
}

export async function updateFaq(id: string, formData: FormData) {
  await requireOwner();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return;
  await prisma.faqItem.update({
    where: { id },
    data: {
      question,
      answer,
      active: formData.get("active") === "on",
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    },
  });
  revalidateFaq();
}

export async function deleteFaq(id: string) {
  await requireOwner();
  await prisma.faqItem.delete({ where: { id } });
  revalidateFaq();
}

export async function updatePolicy(slug: string, formData: FormData) {
  await requireOwner();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await prisma.policy.update({
    where: { slug },
    data: {
      title,
      intro: String(formData.get("intro") ?? "").trim(),
      body: String(formData.get("body") ?? ""),
    },
  });
  revalidatePath("/admin/pages");
  revalidatePath(`/policies/${slug}`);
}
