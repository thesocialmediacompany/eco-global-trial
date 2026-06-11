import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function ProductsGrid({
  products,
  empty = "No products found.",
}: {
  products: Product[];
  empty?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="grid place-items-center rounded-3xl border border-dashed border-purple-200 bg-white/50 py-20 text-center">
        <span className="text-4xl">🧺</span>
        <p className="mt-3 text-purple-900/60">{empty}</p>
      </div>
    );
  }

  return (
    <RevealGroup
      stagger={0.06}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((p) => (
        <RevealItem key={p.id}>
          <ProductCard product={p} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
