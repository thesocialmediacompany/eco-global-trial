import { prisma } from "@/lib/prisma";
import { BundleForm } from "@/components/admin/BundleForm";
import { createBundle } from "../actions";

export default async function NewBundlePage() {
  const products = await prisma.product.findMany({
    where: { isBundle: false, status: "active" },
    orderBy: { title: "asc" },
    select: { id: true, title: true, price: true, emoji: true, gradient: true, imageUrl: true },
  });

  return <BundleForm action={createBundle} products={products} />;
}
