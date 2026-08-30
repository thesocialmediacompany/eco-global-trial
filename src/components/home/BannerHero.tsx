"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

/** Curated transparent-cutout product packs that fan out in the hero. */
const HERO_PACKS = [
  { src: "/hero/oats.png", name: "Steel-Cut Oats", href: "/product/rolled-oats" },
  { src: "/hero/beetroot.png", name: "Beetroot Powder", href: "/product/eco-beetroot-powder" },
  { src: "/hero/flaxseed.png", name: "Whole Flaxseed", href: "/product/eco-flaxseed-whole" },
];

/** Spiky starburst badge (SVG polygon) with stacked text, Alpino-style. */
function Starburst({ top, bottom }: { top: string; bottom: string }) {
  const spikes = 14;
  const outer = 48;
  const inner = 36;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI / spikes) * i - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return (
    <div className="relative grid h-28 w-28 place-items-center sm:h-32 sm:w-32">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full drop-shadow-[0_6px_10px_rgba(34,51,26,.3)]">
        <polygon points={pts.join(" ")} className="fill-purple-700" />
        <polygon points={pts.join(" ")} className="fill-none stroke-cream" strokeWidth="2.5" />
      </svg>
      <span className="relative text-center font-display font-bold uppercase leading-none text-cream">
        <span className="block text-2xl sm:text-3xl">{top}</span>
        <span className="block text-[0.6rem] tracking-wide sm:text-xs">{bottom}</span>
      </span>
    </div>
  );
}

/** Small hand-drawn arrow + label annotation pointing at the product packs. */
function Annotation({
  label,
  className,
  flip,
}: {
  label: string;
  className: string;
  flip?: boolean;
}) {
  return (
    <div className={`pointer-events-none absolute z-30 ${className}`}>
      <span className="font-display text-sm font-bold text-purple-800 sm:text-base" style={{ transform: "rotate(-6deg)" }}>
        {label}
      </span>
      <svg
        viewBox="0 0 60 40"
        className={`h-6 w-9 text-purple-700 ${flip ? "-scale-x-100" : ""}`}
        fill="none"
      >
        <path d="M4 4c22 2 40 14 50 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M46 30l8 6-2-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function BannerHero({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  // fanned pack layout (position / rotation / depth) for the 3 hero packs
  const fan = [
    { left: "1%", rot: -9, z: 10, scale: 0.9 },
    { left: "27%", rot: 3, z: 30, scale: 1 },
    { left: "53%", rot: 11, z: 20, scale: 0.88 },
  ];

  const sunburst =
    "radial-gradient(circle at 50% 42%, rgba(255,255,255,.4), rgba(255,255,255,0) 55%)," +
    "repeating-conic-gradient(from 90deg at 50% 44%, #ffce4a 0deg 6deg, #ffe28a 6deg 12deg)";

  return (
    <section className="relative isolate overflow-hidden" style={{ backgroundImage: sunburst }}>
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:px-8 lg:py-20">
        {/* LEFT — copy */}
        <div className="relative z-10 text-center lg:text-left">
          {badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-700 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-cream shadow-soft-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {badge}
            </span>
          )}

          <h1
            className="mt-5 text-[2.7rem] uppercase leading-[0.95] tracking-wide sm:text-6xl lg:text-[4.7rem]"
            style={{
              fontFamily: "var(--font-hero), var(--font-display), sans-serif",
              color: "var(--color-purple-700)",
              WebkitTextStroke: "2px #fff7ec",
              textShadow:
                "0 2px 0 #21461a, 0 4px 0 #21461a, 0 6px 0 #1a3714, 0 12px 22px rgba(34,51,26,.35)",
            }}
          >
            {title}
          </h1>

          <p className="mx-auto mt-6 max-w-md text-balance text-sm font-bold text-purple-900 underline decoration-gold-500 decoration-dotted decoration-2 underline-offset-4 sm:text-base lg:mx-0">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
            <Link
              href="#new-range"
              className="group inline-flex items-center gap-2 rounded-full bg-purple-700 px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-cream shadow-soft transition-all hover:-translate-y-0.5 hover:bg-purple-800 hover:shadow-soft-lg"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <div className="rotate-[-10deg]">
              <Starburst top="100%" bottom="Natural" />
            </div>
          </div>
        </div>

        {/* RIGHT — fanned product packs (no card — the pack floats on the sunburst) */}
        <div className="relative h-64 sm:h-80 lg:h-[22rem]">
          <Annotation label="Wholesome!" className="left-[6%] top-0" />
          <Annotation label="Real food" className="right-[8%] top-2" flip />

          {HERO_PACKS.map((p, i) => {
            const f = fan[i];
            return (
              <Link
                key={p.src}
                href={p.href}
                className="absolute top-1/2 aspect-[3/4] w-[48%]"
                style={{
                  left: f.left,
                  zIndex: f.z,
                  transform: `translateY(-50%) rotate(${f.rot}deg) scale(${f.scale})`,
                }}
              >
                <Image
                  src={p.src}
                  alt={p.name}
                  fill
                  sizes="(max-width: 1024px) 44vw, 22vw"
                  className="object-contain drop-shadow-[0_18px_24px_rgba(34,51,26,.32)]"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* signature flowing wavy bottom curving into the categories (Alpino-style) */}
      <svg
        aria-hidden
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 z-10 h-12 w-full text-cream-dark sm:h-20"
        fill="currentColor"
      >
        <path d="M0 48C300 14 520 14 780 66 1040 118 1240 118 1440 92V120H0Z" />
      </svg>
    </section>
  );
}
