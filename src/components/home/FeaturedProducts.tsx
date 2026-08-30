import { getFeaturedProducts } from "@/lib/products";
import { cutoutFor } from "@/lib/cutouts";
import { FloatingProductCard } from "@/components/home/FloatingProductCard";
import { ArchedHeading } from "@/components/home/ArchedHeading";
import { WaveDivider } from "@/components/home/WaveDivider";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(12);
  if (products.length === 0) return null;

  return (
    <section
      id="new-range"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#dcefc6_0%,#eef3d2_50%,#fbedca_100%)] pt-12 pb-12 sm:pt-14 sm:pb-14"
    >
      {/* green value-ticker curves down into this gradient band */}
      <WaveDivider edge="top" fillClass="text-purple-900" />

      <div className="mx-auto max-w-3xl px-5">
        <ArchedHeading text="Customer favourites" />
      </div>

      {/* full-bleed, edge-to-edge slider of floating packs */}
      <RevealGroup
        stagger={0.05}
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

      <p className="mt-1 text-center text-xs font-semibold text-purple-900/45">
        Swipe to see more →
      </p>
    </section>
  );
}
