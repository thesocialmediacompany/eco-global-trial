import { prisma } from "@/lib/prisma";
import { excludeHidden } from "@/lib/products";
import { BundleForm } from "@/components/admin/BundleForm";
import { createBundle } from "../actions";

export default async function NewBundlePage() {
  // Exclude HORECA (B2B/bulk) products — they must not go into retail bundles.
  const products = await prisma.product.findMany({
    where: { isBundle: false, status: "active", ...excludeHidden() },
    orderBy: { title: "asc" },
    select: { id: true, title: true, price: true, emoji: true, gradient: true, imageUrl: true },
  });

  return <BundleForm action={createBundle} products={products} />;
}
