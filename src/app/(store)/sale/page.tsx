import type { Metadata } from "next";
import Link from "next/link";
import { getSaleProducts } from "@/lib/products";

// ISR — see product/[slug]/page.tsx. Product saves revalidate "/sale".
export const revalidate = 1800;
import { ProductCard } from "@/components/ui/ProductCard";
import { PageBanner } from "@/components/store/PageBanner";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Special offers & sale",
  description:
    "Save on natural granola, oats, flours, seeds and pantry staples. Current discounts and special offers from Eco Global Foods.",
};

export default async function SalePage() {
  const products = await getSaleProducts();

  return (
    <>
      <PageBanner
        eyebrow="Special offers"
        title="On sale right now"
        description="Genuine markdowns across the range. Stock up on the natural foods you love while these prices last."
        emoji="🏷️"
      />

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        {products.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-purple-100 bg-cream/50 p-10 text-center">
            <p className="text-4xl">🛒</p>
            <h2 className="mt-4 font-display text-xl font-semibold text-purple-900">
              No active offers right now
            </h2>
            <p className="mt-2 text-sm text-purple-900/60">
              Check back soon, or browse the full range in the meantime.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full gradient-purple-green px-6 py-3 text-sm font-semibold text-cream"
            >
              Shop all products
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-8 text-sm font-medium text-purple-900/55">
              {products.length} {products.length === 1 ? "offer" : "offers"} available
            </p>
            <RevealGroup
              stagger={0.04}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
            >
              {products.map((product) => (
                <RevealItem key={product.id}>
                  <ProductCard product={product} />
                </RevealItem>
              ))}
            </RevealGroup>
          </>
        )}
      </section>
    </>
  );
}
