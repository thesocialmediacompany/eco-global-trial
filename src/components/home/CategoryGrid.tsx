"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/categories";
import { SectionHeading } from "@/components/ui/SectionHeading";

// HORECA is a B2B/wholesale category — keep it in the nav + footer, but out of
// the consumer "shop by category" grid on the homepage.
const gridCategories = categories.filter((c) => c.slug !== "horeca");

export function CategoryGrid() {
  return (
    <section id="categories" className="relative bg-cream-dark/50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Stock your pantry"
          description="From breakfast staples to pure spices, dry fruits and flours. Everything you cook with, done right."
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {gridCategories.map((cat, i) => (
            <motion.a
              key={cat.id}
              href={`/category/${cat.slug}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className={`group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl p-5 text-cream shadow-sm ${cat.gradient}`}
            >
              {/* decorative glow */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-2xl transition-transform duration-500 group-hover:scale-150" />

              <div className="flex items-start justify-between">
                <span className="text-4xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 sm:text-5xl">
                  {cat.emoji}
                </span>
                {cat.isNew && (
                  <span className="rounded-full bg-cream/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-purple-800">
                    New
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-display text-lg font-semibold leading-tight sm:text-xl">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-cream/75">{cat.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cream/90">
                  Shop now
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
