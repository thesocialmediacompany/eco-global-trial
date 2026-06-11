import type { Metadata } from "next";
import { searchProducts } from "@/lib/products";
import { PageBanner } from "@/components/store/PageBanner";
import { ProductsGrid } from "@/components/store/ProductsGrid";
import { SearchBox } from "@/components/store/SearchBox";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Eco Global Foods range.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const products = query ? await searchProducts(query) : [];

  return (
    <>
      <PageBanner
        eyebrow="Search"
        title="Find your goodness"
        description="Search across granola, oats, malted drinks, protein bars and more."
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-10 max-w-xl">
            <SearchBox initial={query} />
          </div>
          {query && (
            <p className="mb-6 text-sm text-purple-900/60">
              {products.length} result{products.length === 1 ? "" : "s"} for{" "}
              <span className="font-semibold text-purple-900">&ldquo;{query}&rdquo;</span>
            </p>
          )}
          <ProductsGrid
            products={products}
            empty={
              query
                ? "No products matched your search. Try a different term."
                : "Type something above to start searching."
            }
          />
        </div>
      </section>
    </>
  );
}
