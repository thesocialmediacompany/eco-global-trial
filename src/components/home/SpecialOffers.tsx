import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSaleProducts } from "@/lib/products";
import { cutoutFor } from "@/lib/cutouts";
import { FloatingProductCard } from "@/components/home/FloatingProductCard";
import { ArchedHeading } from "@/components/home/ArchedHeading";
import { WaveDivider } from "@/components/home/WaveDivider";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

/** Homepage "Special offers" band — products with a genuine discount. */
export async function SpecialOffers() {
  const products = await getSaleProducts(10);
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fbe6cf_0%,#fadfd6_50%,#f6d3dc_100%)] pt-12 pb-12 sm:pt-14 sm:pb-14">
      {/* the featured band's warm edge curves down into this rose gradient */}
      <WaveDivider edge="top" fillClass="text-[#fbedca]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl"
      />
      <div className="relative">
        <div className="mx-auto max-w-3xl px-5">
          <ArchedHeading text="On sale this week" />
        </div>

        {/* full-bleed, edge-to-edge slider of floating packs */}
        <RevealGroup
          stagger={0.06}
          className="mt-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 pt-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-4 sm:gap-5 sm:px-6"
        >
          {products.map((product) => (
            <RevealItem
              key={product.id}
              className="w-[62%] shrink-0 snap-start sm:w-[38%] lg:w-[23%] xl:w-[19%]"
            >
              <FloatingProductCard product={product} cutout={cutoutFor(product.slug)} />
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-5 flex justify-center">
          <Link
            href="/sale"
            className="group inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-rose-600 shadow-soft-sm ring-1 ring-rose-200 transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            View all offers
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
