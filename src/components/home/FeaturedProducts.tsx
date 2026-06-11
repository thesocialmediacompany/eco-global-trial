import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  if (products.length === 0) return null;

  return (
    <section id="new-range" className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Featured"
          title="Our picks for you"
          description="Hand-picked favourites from across the range. Good food that fits a busy day."
        />

        <RevealGroup
          stagger={0.08}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {products.map((product) => (
            <RevealItem key={product.id}>
              <ProductCard product={product} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
