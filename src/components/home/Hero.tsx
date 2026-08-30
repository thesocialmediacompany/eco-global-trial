"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { CoverSlider } from "@/components/store/CoverSlider";
import { HeroSlider, type HeroSlide } from "@/components/home/HeroSlider";

export interface HeroCover {
  mode: "gradient" | "slider";
  gradient: string;
  animated: boolean;
  gradientSpeed: number;
  images: string[];
  autoplayMs: number;
}

export function Hero({
  badge,
  title,
  subtitle,
  cover,
  products = [],
}: {
  badge: string;
  title: string;
  subtitle: string;
  cover?: HeroCover | null;
  /** Featured products shown in the swipeable hero slider. */
  products?: HeroSlide[];
}) {
  const words = title.trim().split(/\s+/);
  const isSlider = cover?.mode === "slider" && cover.images.length > 0;

  // Photo-cover slider keeps its own look; the default hero is the Alpino-style
  // peach panel below.
  if (isSlider) {
    return (
      <section className="relative isolate overflow-hidden pt-20 pb-16 text-cream sm:pt-24">
        <CoverSlider images={cover!.images} autoplayMs={cover!.autoplayMs} />
        <div className="relative mx-auto max-w-4xl px-5 text-center">
          <h1 className="font-display text-5xl font-bold sm:text-6xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-cream/85">{subtitle}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-cream pt-14 pb-24 sm:pt-20 lg:pb-28">
      {/* soft peach glow blobs */}
      <div aria-hidden className="pointer-events-none absolute -left-24 top-6 h-80 w-80 rounded-full bg-gold-300/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-16 bottom-10 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-5 text-center">
        {/* sticker badge */}
        <motion.span
          initial={{ opacity: 0, y: 14, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-purple-700 shadow-soft-sm ring-ink backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {badge}
        </motion.span>

        {/* chunky headline, last word highlighted with a hand-drawn underline */}
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.02] tracking-tight text-purple-900 sm:text-6xl lg:text-7xl">
          {words.map((word, i) => {
            const last = i === words.length - 1;
            return (
              <motion.span
                key={`${word}-${i}`}
                className={`inline-block ${last ? "relative mx-[0.12em] text-purple-600" : "mr-[0.22em]"}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
                {last && (
                  <svg
                    aria-hidden
                    viewBox="0 0 220 20"
                    preserveAspectRatio="none"
                    className="absolute -bottom-2 left-0 h-3 w-full text-gold-400"
                    fill="none"
                  >
                    <path d="M3 14c46-11 130-14 214-6" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
                  </svg>
                )}
              </motion.span>
            );
          })}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mt-7 max-w-xl text-balance text-base font-medium text-purple-900/70 sm:text-lg"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3.5"
        >
          <Link
            href="#new-range"
            className="group inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-sm font-bold text-cream shadow-soft transition-all hover:-translate-y-0.5 hover:bg-purple-700 hover:shadow-soft-lg"
          >
            Shop the New Range
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#categories"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-purple-900 shadow-soft-sm ring-ink transition-all hover:-translate-y-0.5 hover:shadow-soft"
          >
            Explore Categories
          </Link>
        </motion.div>

        {/* stat chips */}
        <motion.dl
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mx-auto mt-11 flex max-w-xl flex-wrap items-center justify-center gap-3"
        >
          {[
            { value: 25, suffix: "+", label: "Years in food", rot: "-2deg" },
            { value: 100, suffix: "%", label: "Natural", rot: "1.5deg" },
            { value: 120, suffix: "+", label: "Products", rot: "-1deg" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ rotate: s.rot }}
              className="rounded-2xl bg-white px-5 py-3 shadow-soft-sm ring-ink"
            >
              <dt className="font-display text-2xl font-bold text-purple-700">
                <CountUp value={s.value} suffix={s.suffix} />
              </dt>
              <dd className="text-xs font-semibold text-purple-900/60">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* swipeable product slider (replaces the old floating pack-shots) */}
      <div className="relative mx-auto mt-2 max-w-6xl px-5 lg:px-8">
        <HeroSlider products={products} />
      </div>

      {/* signature wavy divider into the next section */}
      <svg
        aria-hidden
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-10 w-full text-purple-900 sm:h-14"
        fill="currentColor"
      >
        <path d="M0 80V38c180 34 360 34 540 8s360-60 540-34 240 42 360 34v34H0Z" />
      </svg>
    </section>
  );
}
