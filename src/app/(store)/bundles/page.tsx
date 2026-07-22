import type { Metadata } from "next";
import { getProductsByCollection } from "@/lib/products";
import { PageCover } from "@/components/store/PageCover";
import { ProductsGrid } from "@/components/store/ProductsGrid";

// ISR — see product/[slug]/page.tsx.
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Bundles",
  description:
    "Save when you buy together. Breakfast, wellness and baking bundles at a better price than buying each on its own.",
};

export default async function BundlesPage() {
  const bundles = await getProductsByCollection("bundles");

  return (
    <>
      <PageCover pageKey="bundles"
        emoji="🎁"
        eyebrow="Better together"
        title="Curated Bundles"
        description="A few of our favourites, put together so you pay less than buying them separately."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ProductsGrid
            products={bundles}
            empty="No bundles available right now. Check back soon."
          />
        </div>
      </section>
    </>
  );
}
