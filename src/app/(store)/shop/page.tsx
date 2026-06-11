import type { Metadata } from "next";
import { getShopProducts, getPriceRange, type ShopSort } from "@/lib/products";
import { categories } from "@/data/categories";
import { PageBanner } from "@/components/store/PageBanner";
import { ProductsGrid } from "@/components/store/ProductsGrid";
import { ShopControls } from "@/components/store/ShopControls";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse the full Eco Global Foods range: granola, oats, malted drinks, protein bars, spices and more. Delivered across Pakistan.",
};

const VALID_SORTS: ShopSort[] = ["new", "price-asc", "price-desc", "name"];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
    sort?: string;
    collection?: string;
    min?: string;
    max?: string;
    instock?: string;
  }>;
}) {
  const sp = await searchParams;
  const isNew = sp.filter === "new";
  const sort = (VALID_SORTS.includes(sp.sort as ShopSort) ? sp.sort : "new") as ShopSort;
  const minPrice = sp.min ? Number(sp.min) : undefined;
  const maxPrice = sp.max ? Number(sp.max) : undefined;

  const [products, priceRange] = await Promise.all([
    getShopProducts({
      sort,
      collection: sp.collection || undefined,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      inStock: sp.instock === "1",
      isNew,
    }),
    getPriceRange(),
  ]);

  return (
    <>
      <PageBanner
        eyebrow="Shop"
        title={isNew ? "Newly Launched Range" : "All Products"}
        description="Natural food made with real ingredients, for the way you eat today."
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ShopControls
            collections={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            priceMax={priceRange.max}
            total={products.length}
          />

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-purple-200 bg-white/60 py-20 text-center text-purple-900/55">
              No products match these filters. Try widening your price range or clearing filters.
            </div>
          ) : (
            <ProductsGrid products={products} />
          )}
        </div>
      </section>
    </>
  );
}
