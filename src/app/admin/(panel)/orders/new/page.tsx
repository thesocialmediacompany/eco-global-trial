import { prisma } from "@/lib/prisma";
import { ManualOrderForm } from "@/components/admin/ManualOrderForm";

export default async function NewOrderPage() {
  const products = await prisma.product.findMany({
    where: { status: "active" },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
    orderBy: { title: "asc" },
  });

  return (
    <ManualOrderForm
      products={products.map((p) => ({
        id: p.id,
        title: p.title,
        emoji: p.emoji,
        gradient: p.gradient,
        price: p.price,
        variants: p.variants.map((v) => ({ title: v.title, price: v.price })),
      }))}
    />
  );
}
