import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, collections] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { sortOrder: "asc" } },
        collectionLinks: { select: { collectionId: true } },
      },
    }),
    prisma.collection.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, product.id);

  return (
    <ProductForm
      action={updateWithId}
      collections={collections.map((c) => ({ id: c.id, name: c.name }))}
      extraCollectionIds={product.collectionLinks.map((l) => l.collectionId)}
      product={{
        id: product.id,
        title: product.title,
        tagline: product.tagline,
        description: product.description,
        status: product.status,
        emoji: product.emoji,
        gradient: product.gradient,
        imageUrl: product.imageUrl,
        images: product.images,
        badges: product.badges,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        vendor: product.vendor,
        isNew: product.isNew,
        isBestseller: product.isBestseller,
        isFeatured: product.isFeatured,
        collectionId: product.collectionId,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        seoKeywords: product.seoKeywords,
        ingredients: product.ingredients,
        allergens: product.allergens,
        nutrition: (() => {
          try {
            const r = JSON.parse(product.nutritionJson || "[]");
            return Array.isArray(r) ? r : [];
          } catch {
            return [];
          }
        })(),
        variants: product.variants.map((v) => ({
          id: v.id,
          title: v.title,
          price: v.price,
          inventoryQty: v.inventoryQty,
          weightGrams: v.weightGrams,
        })),
      }}
    />
  );
}
