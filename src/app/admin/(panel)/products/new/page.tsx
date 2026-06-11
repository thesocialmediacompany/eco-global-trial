import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <ProductForm
      action={createProduct}
      collections={collections.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
