import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { getSaleProducts } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

/** Homepage "Special offers" band — products with a genuine discount. */
export async function SpecialOffers() {
  const products = await getSaleProducts(10);
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-y border-amber-100 bg-gradient-to-br from-amber-50/80 via-cream to-rose-50/60 py-12 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-600">
              <Tag className="h-3.5 w-3.5" /> Special offers
            </span>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-purple-900 sm:text-5xl">
              On sale this week
            </h2>
            <p className="mt-3 text-base text-purple-900/65 sm:text-lg">
              Real savings on real food. Grab these natural pantry staples while
              the prices are down.
            </p>
          </div>
          <Link
            href="/sale"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
          >
            View all offers
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile: snap carousel · Desktop: grid */}
        <RevealGroup
          stagger={0.06}
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-12 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4"
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
