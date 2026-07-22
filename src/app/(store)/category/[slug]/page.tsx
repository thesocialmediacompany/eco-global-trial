import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProductsByCollection } from "@/lib/products";
import { PageCover } from "@/components/store/PageCover";
import { ProductsGrid } from "@/components/store/ProductsGrid";

// ISR — see product/[slug]/page.tsx. Admin product/collection saves revalidate
// this path so category listings refresh immediately on edit.
export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await prisma.collection.findUnique({ where: { slug } });
  if (!collection) return { title: "Category not found" };
  return {
    title: collection.seoTitle || collection.name,
    description: collection.seoDescription || collection.tagline,
    keywords: collection.seoKeywords ? collection.seoKeywords.split(",") : undefined,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await prisma.collection.findUnique({ where: { slug } });
  if (!collection) notFound();

  const products = await getProductsByCollection(slug);

  return (
    <>
      <PageCover pageKey={slug}
        emoji={collection.emoji}
        eyebrow="Collection"
        title={collection.name}
        description={collection.tagline || collection.seoDescription}
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {collection.description && (
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="text-base leading-relaxed text-purple-900/70 sm:text-lg">
                {collection.description}
              </p>
            </div>
          )}
          <p className="mb-8 text-sm text-purple-900/60">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
          <ProductsGrid
            products={products}
            empty="No products in this collection yet. Check back soon."
          />
        </div>
      </section>
    </>
  );
}
