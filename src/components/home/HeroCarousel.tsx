"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface Pack {
  src: string;
  name: string;
  href: string;
}
interface Annotation {
  label: string;
  side: "left" | "right";
}
export interface Poster {
  /** background design template — each poster looks visibly different */
  template: "rays" | "dots" | "blobs" | "image" | "banner";
  base: string; // base background (solid colour or gradient)
  accent: string; // ray / dot / blob accent colour
  /** full-bleed background photo (used when template === "image" | "banner") */
  image?: string;
  /** optional portrait image shown instead of `image` on small screens */
  imageMobile?: string;
  badge: string;
  title: string;
  subtitle: string;
  shopHref: string;
  starburst: [string, string];
  packs: Pack[];
  annotations: Annotation[];
}

/** Per-template decorative background. */
function PosterBg({ p }: { p: Poster }) {
  if (p.template === "banner") {
    // a complete designed banner — just the image, no scrim or overlay
    if (!p.image) return null;
    return (
      <>
        {p.imageMobile && (
          <Image src={p.imageMobile} alt={p.title} fill priority sizes="100vw" className="object-cover object-center sm:hidden" />
        )}
        <Image
          src={p.image}
          alt={p.title}
          fill
          priority
          sizes="100vw"
          className={`object-cover object-center ${p.imageMobile ? "hidden sm:block" : ""}`}
        />
      </>
    );
  }
  if (p.template === "image") {
    return (
      <>
        {p.imageMobile && (
          <Image src={p.imageMobile} alt="" fill sizes="100vw" className="object-cover sm:hidden" />
        )}
        {p.image && (
          <Image src={p.image} alt="" fill sizes="100vw" className={`object-cover ${p.imageMobile ? "hidden sm:block" : ""}`} />
        )}
      </>
    );
  }
  if (p.template === "rays") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            `radial-gradient(circle at 50% 42%, rgba(255,255,255,.4), rgba(255,255,255,0) 55%),` +
            `repeating-conic-gradient(from 90deg at 50% 44%, ${p.accent} 0deg 6deg, ${p.base} 6deg 12deg)`,
        }}
      />
    );
  }
  if (p.template === "dots") {
    return (
      <>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, ${p.accent} 2.5px, transparent 2.6px)`,
            backgroundSize: "26px 26px",
          }}
        />
        <div className="pointer-events-none absolute inset-4 rounded-[2rem] border-[3px] border-dashed border-white/70 sm:inset-6" />
      </>
    );
  }
  // blobs — bold confetti circles
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* big colour washes */}
      <span className="absolute -left-24 -top-16 h-[26rem] w-[26rem] rounded-full bg-green-400/55 blur-2xl" />
      <span className="absolute -right-20 -bottom-24 h-[30rem] w-[30rem] rounded-full bg-gold-400/55 blur-2xl" />
      <span className="absolute left-1/3 top-0 h-72 w-72 rounded-full bg-rose-400/40 blur-2xl" />
      {/* crisp confetti dots */}
      <span className="absolute left-[12%] top-[16%] h-9 w-9 rounded-full bg-green-500 shadow-soft-sm" />
      <span className="absolute right-[16%] top-[20%] h-6 w-6 rounded-full bg-rose-500" />
      <span className="absolute left-[47%] bottom-[14%] h-7 w-7 rounded-full bg-gold-500" />
      <span className="absolute right-[9%] bottom-[28%] h-8 w-8 rounded-full bg-purple-600" />
      <span className="absolute left-[24%] bottom-[22%] h-5 w-5 rounded-full bg-rose-400" />
      <span className="absolute right-[30%] top-[8%] h-4 w-4 rounded-full bg-gold-400" />
    </div>
  );
}

/** Spiky starburst badge (SVG polygon) with stacked text. */
function Starburst({ top, bottom }: { top: string; bottom: string }) {
  const spikes = 14;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 ? 36 : 48;
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

/** hand-drawn arrow + label pointing at the packs */
function Note({ label, className, flip }: { label: string; className: string; flip?: boolean }) {
  return (
    <div className={`pointer-events-none absolute z-30 ${className}`}>
      <span className="font-display text-sm font-bold text-purple-800 sm:text-base" style={{ transform: "rotate(-6deg)" }}>
        {label}
      </span>
      <svg viewBox="0 0 60 40" className={`h-6 w-9 text-purple-700 ${flip ? "-scale-x-100" : ""}`} fill="none">
        <path d="M4 4c22 2 40 14 50 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M46 30l8 6-2-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const FAN = [
  { left: "0%", rot: -9, z: 10, scale: 0.9 },
  { left: "26%", rot: 3, z: 30, scale: 1 },
  { left: "52%", rot: 11, z: 20, scale: 0.88 },
];

/** One full-width hero poster (no wave — the carousel owns that). */
function HeroPoster({ p }: { p: Poster }) {
  return (
    <div className="relative h-[470px] w-full shrink-0 overflow-hidden sm:h-[540px] lg:h-[600px]" style={{ background: p.base }}>
      <PosterBg p={p} />
      {p.template !== "banner" && (
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-6 px-5 py-6 sm:gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:px-8">
        {/* copy */}
        <div className="relative z-10 text-center lg:text-left">
          {p.badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-700 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-cream shadow-soft-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {p.badge}
            </span>
          )}
          <h1
            className="mt-5 text-[2.7rem] uppercase leading-[0.95] tracking-wide sm:text-6xl lg:text-[4.4rem]"
            style={{
              fontFamily: "var(--font-hero), var(--font-display), sans-serif",
              color: "var(--color-purple-700)",
              WebkitTextStroke: "2px #fff7ec",
              textShadow: "0 2px 0 #21461a, 0 4px 0 #21461a, 0 6px 0 #1a3714, 0 12px 22px rgba(34,51,26,.35)",
            }}
          >
            {p.title}
          </h1>
          <p
            className={`mx-auto mt-6 max-w-md text-balance text-sm font-bold underline decoration-dotted decoration-2 underline-offset-4 sm:text-base lg:mx-0 ${
              p.template === "image"
                ? "text-cream decoration-gold-300"
                : "text-purple-900 decoration-gold-500"
            }`}
            style={
              p.template === "image"
                ? { textShadow: "0 1px 2px rgba(18,28,12,.95), 0 2px 8px rgba(18,28,12,.85), 0 0 3px rgba(18,28,12,.9)" }
                : { textShadow: "0 1px 3px rgba(255,247,236,0.95), 0 0 10px rgba(255,247,236,0.85)" }
            }
          >
            {p.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
            <Link
              href={p.shopHref}
              className="group inline-flex items-center gap-2 rounded-full bg-purple-700 px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-cream shadow-soft transition-all hover:-translate-y-0.5 hover:bg-purple-800 hover:shadow-soft-lg"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <div className="rotate-[-10deg]">
              <Starburst top={p.starburst[0]} bottom={p.starburst[1]} />
            </div>
          </div>
        </div>

        {/* packs (hidden on photo posters — the image is the visual) */}
        {p.template !== "image" && (
        <div className="relative h-64 sm:h-80 lg:h-[22rem]">
          {p.annotations.map((a) => (
            <Note
              key={a.label}
              label={a.label}
              className={a.side === "left" ? "left-[6%] top-0" : "right-[8%] top-2"}
              flip={a.side === "right"}
            />
          ))}
          {p.packs.slice(0, 3).map((pack, i) => {
            const f = FAN[i];
            return (
              <Link
                key={pack.src}
                href={pack.href}
                className="absolute top-1/2 aspect-[3/4] w-[48%]"
                style={{ left: f.left, zIndex: f.z, transform: `translateY(-50%) rotate(${f.rot}deg) scale(${f.scale})` }}
              >
                <Image
                  src={pack.src}
                  alt={pack.name}
                  fill
                  sizes="(max-width: 1024px) 44vw, 22vw"
                  className="object-contain drop-shadow-[0_18px_24px_rgba(34,51,26,.32)]"
                />
              </Link>
            );
          })}
        </div>
        )}
      </div>
      )}
    </div>
  );
}

export function HeroCarousel({ posters }: { posters: Poster[] }) {
  const [index, setIndex] = useState(0);
  const n = posters.length;
  const paused = useRef(false);

  const go = (i: number) => setIndex(((i % n) + n) % n);

  useEffect(() => {
    if (n <= 1) return;
    const id = setInterval(() => {
      if (!paused.current) setIndex((x) => (x + 1) % n);
    }, 6000);
    return () => clearInterval(id);
  }, [n]);

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div
        className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {posters.map((p) => (
          <HeroPoster key={p.title} p={p} />
        ))}
      </div>

      {/* arrows */}
      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-purple-800 shadow-soft transition hover:bg-white sm:left-5 sm:grid"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-purple-800 shadow-soft transition hover:bg-white sm:right-5 sm:grid"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* dots */}
          <div className="absolute bottom-16 left-1/2 z-40 flex -translate-x-1/2 gap-2 sm:bottom-24">
            {posters.map((p, i) => (
              <button
                key={p.title}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => go(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-7 bg-purple-700" : "w-2.5 bg-purple-700/35 hover:bg-purple-700/60"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* signature flowing wavy bottom into the categories */}
      <svg
        aria-hidden
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 w-full text-cream-dark sm:h-20"
        fill="currentColor"
      >
        <path d="M0 48C300 14 520 14 780 66 1040 118 1240 118 1440 92V120H0Z" />
      </svg>
    </section>
  );
}
