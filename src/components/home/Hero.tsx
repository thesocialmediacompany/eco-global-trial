"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { CoverSlider } from "@/components/store/CoverSlider";

export interface HeroCover {
  mode: "gradient" | "slider";
  gradient: string;
  animated: boolean;
  images: string[];
  autoplayMs: number;
}

// dx/dy = how far each token drifts (px) as the user scrolls down the hero.
const floats = [
  { emoji: "🥣", className: "left-[6%] top-[18%]", delay: 0, dx: -150, dy: 70 },
  { emoji: "🍫", className: "right-[8%] top-[12%]", delay: 0.6, dx: 160, dy: 90 },
  { emoji: "🌾", className: "left-[12%] bottom-[16%]", delay: 1.1, dx: -120, dy: -50 },
  { emoji: "🥛", className: "right-[10%] bottom-[20%]", delay: 0.3, dx: 140, dy: -40 },
  { emoji: "🍓", className: "left-[44%] top-[8%]", delay: 0.9, dx: 50, dy: -130 },
];

/** A hero token that drifts across + fades as the user scrolls (parallax). */
function FloatEmoji({
  emoji,
  className,
  delay,
  dx,
  dy,
}: {
  emoji: string;
  className: string;
  delay: number;
  dx: number;
  dy: number;
}) {
  const { scrollY } = useScroll();
  const x = useTransform(scrollY, [0, 700], [0, dx]);
  const y = useTransform(scrollY, [0, 700], [0, dy]);
  const opacity = useTransform(scrollY, [0, 450], [1, 0]);

  return (
    <motion.span
      aria-hidden
      style={{ x, y, opacity }}
      className={`pointer-events-none absolute hidden md:block ${className}`}
    >
      <motion.span
        className="block text-4xl drop-shadow-xl lg:text-5xl"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1, y: [0, -16, 0] }}
        transition={{
          opacity: { delay: 0.8 + delay, duration: 0.6 },
          scale: { delay: 0.8 + delay, duration: 0.6 },
          y: { duration: 5 + delay, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {emoji}
      </motion.span>
    </motion.span>
  );
}

export function Hero({
  badge,
  title,
  subtitle,
  cover,
}: {
  badge: string;
  title: string;
  subtitle: string;
  cover?: HeroCover | null;
}) {
  // Split the editable title into words; highlight the last word in gold.
  const words = title.trim().split(/\s+/);
  const isSlider = cover?.mode === "slider" && cover.images.length > 0;
  const gradientClass = cover?.gradient || "gradient-purple-green";
  const animated = cover?.animated && !isSlider;
  return (
    <section
      className={`relative isolate overflow-hidden pt-20 pb-16 text-cream sm:pt-24 lg:pb-20 ${
        isSlider ? "" : `${gradientClass} ${animated ? "gradient-animated" : ""}`
      }`}
    >
      {/* editable cover image slider */}
      {isSlider && <CoverSlider images={cover!.images} autoplayMs={cover!.autoplayMs} />}

      {/* animated background orbs (hidden when a photo cover is shown) */}
      {!isSlider && (
        <>
          <motion.div
            aria-hidden
            className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-purple-500/40 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-green-400/30 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* floating product tokens (drift on scroll) */}
      {floats.map((f) => (
        <FloatEmoji key={f.emoji + f.className} {...f} />
      ))}

      <div className="relative mx-auto max-w-7xl px-5 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-cream/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-gold-300" />
          {badge}
        </motion.div>

        <h1 className="mx-auto flex max-w-4xl flex-wrap items-baseline justify-center gap-x-[0.28em] font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              className={i === words.length - 1 ? "inline-block text-gradient-gold" : "inline-block"}
              initial={{ opacity: 0, y: 40, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.15 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mx-auto mt-6 max-w-xl text-balance text-base text-cream/85 sm:text-lg"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="#new-range"
            className="group inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 text-sm font-semibold text-purple-900 shadow-xl shadow-purple-950/30 transition-all hover:gap-3 hover:bg-white"
          >
            Shop the New Range
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#categories"
            className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-white/5 px-7 py-3.5 text-sm font-semibold text-cream backdrop-blur transition-colors hover:bg-white/15"
          >
            Explore Categories
          </Link>
        </motion.div>

        {/* stats */}
        <motion.dl
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-cream/15 pt-6"
        >
          {[
            { value: 25, suffix: "+", label: "Years in food" },
            { value: 100, suffix: "%", label: "Natural ingredients" },
            { value: 120, suffix: "+", label: "Products" },
          ].map((s) => (
            <div key={s.label}>
              <dt className="font-display text-3xl font-semibold text-gold-300 sm:text-4xl">
                <CountUp value={s.value} suffix={s.suffix} />
              </dt>
              <dd className="mt-1 text-xs text-cream/70 sm:text-sm">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* soft fade to page background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-cream" />
    </section>
  );
}
