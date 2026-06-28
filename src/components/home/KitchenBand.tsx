import Image from "next/image";
import Link from "next/link";
import { getFeaturedGalleryImages } from "@/lib/media";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

/**
 * Homepage "From our kitchen" band — real food visuals (grains, flours, oats,
 * cooked dishes), not packshots. Pulls gallery photos flagged `featured`.
 */
export async function KitchenBand() {
  const items = await getFeaturedGalleryImages(6);
  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-purple-950 py-14 text-cream sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-green-500/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="From our kitchen"
          title="Real food, really made"
          description="Wholesome grains, freshly milled flours and dishes cooked from our range. This is what natural looks like."
          tone="light"
        />

        <RevealGroup
          stagger={0.05}
          className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6"
        >
          {items.map((g) => (
            <RevealItem
              key={g.id}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10"
            >
              {g.url ? (
                <Image
                  src={g.url}
                  alt={g.caption || "Eco Global Foods"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className={`flex h-full w-full items-center justify-center ${g.gradient}`}>
                  <span className="text-4xl drop-shadow sm:text-5xl">{g.emoji}</span>
                </div>
              )}
              {g.caption && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-purple-950/80 to-transparent p-2.5">
                  <p className="text-[0.7rem] font-medium leading-tight text-cream/90">
                    {g.caption}
                  </p>
                </div>
              )}
              {g.productSlug && (
                <Link
                  href={`/product/${g.productSlug}`}
                  className="absolute inset-0 z-20"
                  aria-label={g.caption || "View product"}
                />
              )}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
