"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  slug: string;
  name: string;
  imageUrl?: string | null;
  emoji?: string;
  gradient?: string;
}

/**
 * Swipeable hero product slider (replaces the old floating pack-shots). Native
 * scroll-snap gives touch swipe on mobile for free; arrow buttons drive it on
 * desktop. Cards peek at the edges so it reads as "there's more — swipe".
 */
export function HeroSlider({ products }: { products: HeroSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function nudge(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
  }

  return (
    <div className="relative mt-14">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
      >
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/product/${p.slug}`}
            className="group relative aspect-square w-[64%] shrink-0 snap-center overflow-hidden rounded-[1.75rem] bg-white shadow-soft transition-transform duration-300 hover:-translate-y-1 sm:w-[42%] lg:w-[24%]"
          >
            {p.imageUrl ? (
              <Image
                src={p.imageUrl}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 64vw, (max-width: 1024px) 42vw, 24vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className={`grid h-full w-full place-items-center text-6xl ${
                  p.gradient ?? "bg-cream-dark"
                }`}
              >
                {p.emoji}
              </div>
            )}
            <span className="pointer-events-none absolute inset-x-2.5 bottom-2.5 truncate rounded-full bg-white/90 px-3 py-1.5 text-center text-xs font-bold text-purple-900 shadow-soft-sm backdrop-blur">
              {p.name}
            </span>
          </Link>
        ))}
      </div>

      {/* desktop arrows */}
      <button
        type="button"
        aria-label="Previous products"
        onClick={() => nudge(-1)}
        className="absolute -left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-purple-900 shadow-soft transition hover:-translate-y-[calc(50%+2px)] lg:grid"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next products"
        onClick={() => nudge(1)}
        className="absolute -right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-purple-900 shadow-soft transition hover:-translate-y-[calc(50%+2px)] lg:grid"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <p className="mt-3 text-center text-xs font-semibold text-purple-900/40 lg:hidden">
        Swipe to explore →
      </p>
    </div>
  );
}
