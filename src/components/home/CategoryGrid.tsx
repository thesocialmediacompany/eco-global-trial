"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/categories";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveDivider } from "@/components/home/WaveDivider";

// HORECA is a B2B/wholesale category — keep it in the nav + footer, but out of
// the consumer "shop by category" grid on the homepage.
const gridCategories = categories.filter((c) => c.slug !== "horeca");

// Playful accent colours that ring each plate on hover (Alpino-style). Rotated
// per category so neighbouring plates always differ.
const RING_COLORS = [
  "#4e9c33", // green
  "#e8a417", // amber
  "#c0563b", // terracotta
  "#b8477e", // berry
  "#3f9e8f", // teal
  "#8a63d2", // violet
];

/**
 * Alpino-style "shop by category" grid — each category sits on a round white
 * plate. The plate shows a real food photo (`cat.image` if set, otherwise a
 * representative product photo passed in `thumbs`), falling back to the emoji.
 */
export function CategoryGrid({ thumbs = {} }: { thumbs?: Record<string, string> }) {
  return (
    <section id="categories" className="relative overflow-hidden bg-cream-dark pt-14 pb-20 sm:pt-16 sm:pb-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Stock your pantry"
          description="From breakfast staples to pure spices, dry fruits and flours. Everything you cook with, done right."
        />

        <div className="mt-12 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
          {gridCategories.map((cat, i) => {
            // A dedicated food photo fills the plate (Alpino-style); a fallback
            // product packshot sits centered with padding, like an item on a plate.
            const photo = cat.image || thumbs[cat.slug];
            const isFood = Boolean(cat.image);
            const ring = RING_COLORS[i % RING_COLORS.length];
            return (
              <motion.a
                key={cat.id}
                href={`/category/${cat.slug}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col items-center text-center"
              >
                {/* plate + colour hover ring (lift the whole group together) */}
                <div className="relative aspect-square w-full transition-transform duration-300 group-hover:-translate-y-1.5">
                  {/* coloured ring that appears on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-[6px] scale-90 rounded-full border-[3px] opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                    style={{ borderColor: ring }}
                  />
                  {/* little accent dot (skip when the New badge already sits here) */}
                  {!cat.isNew && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-[6%] top-[2%] z-20 h-3.5 w-3.5 scale-0 rounded-full opacity-0 shadow-soft-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                      style={{ backgroundColor: ring }}
                    />
                  )}

                  {/* the plate */}
                  <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-white shadow-soft transition-shadow duration-300 group-hover:shadow-soft-lg">
                    {/* subtle plate rim */}
                    <span className="pointer-events-none absolute inset-[8%] z-10 rounded-full ring-1 ring-purple-900/10" />

                    {photo ? (
                      <Image
                        src={photo}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 30vw, (max-width: 1024px) 22vw, 15vw"
                        className={`transition-transform duration-300 group-hover:scale-105 ${
                          isFood ? "object-cover" : "object-contain p-[15%]"
                        }`}
                      />
                    ) : (
                      <span className="text-4xl transition-transform duration-300 group-hover:scale-110 sm:text-5xl">
                        {cat.emoji}
                      </span>
                    )}

                    {cat.isNew && (
                      <span className="absolute right-1 top-1 z-20 rounded-full bg-purple-600 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-cream shadow-soft-sm">
                        New
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mt-3.5 font-display text-sm font-bold leading-tight text-purple-900 sm:text-base">
                  {cat.name}
                </h3>
                <span className="mt-0.5 inline-flex items-center gap-0.5 text-xs font-semibold text-purple-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Shop <ArrowUpRight className="h-3 w-3" />
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
      {/* categories curve down into the green value ticker */}
      <WaveDivider edge="bottom" fillClass="text-purple-900" />
    </section>
  );
}
