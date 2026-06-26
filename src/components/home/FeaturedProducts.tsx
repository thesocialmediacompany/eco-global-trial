import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(12);
  if (products.length === 0) return null;

  return (
    <section id="new-range" className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Featured"
          title="Top picks for you"
          description="Hand-picked favourites from across the range. Good food that fits a busy day."
        />

        {/*
          Mobile: horizontal snap-scroll carousel (cards ~78% wide so the next peeks).
          Desktop (sm+): standard responsive grid.
        */}
        <RevealGroup
          stagger={0.06}
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-14 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4"
        >
          {products.map((product) => (
            <RevealItem
              key={product.id}
              className="w-[78%] shrink-0 snap-start sm:w-auto sm:shrink"
            >
              <ProductCard product={product} />
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="mt-2 text-center text-xs font-medium text-purple-900/40 sm:hidden">
          Swipe to see more →
        </p>
      </div>
    </section>
  );
}
