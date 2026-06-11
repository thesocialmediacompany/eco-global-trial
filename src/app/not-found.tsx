import Link from "next/link";
import { Leaf, Home, ShoppingBag, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden gradient-purple-green px-5 text-center text-cream">
      <div
        aria-hidden
        className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-green-400/20 blur-3xl"
      />

      <div className="relative">
        <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
            <Leaf className="h-5 w-5 text-green-300" />
          </span>
          <span className="font-display text-lg font-semibold">Eco Global Foods</span>
        </Link>

        <p className="text-7xl">🌾</p>
        <h1 className="mt-6 font-display text-6xl font-semibold tracking-tight sm:text-8xl">
          404
        </h1>
        <p className="mx-auto mt-4 max-w-md text-cream/80">
          This page has wandered off. Let&apos;s get you back on track.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-semibold text-purple-900 transition hover:bg-white"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-white/5 px-6 py-3 text-sm font-semibold text-cream backdrop-blur transition hover:bg-white/15"
          >
            <ShoppingBag className="h-4 w-4" /> Shop
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-white/5 px-6 py-3 text-sm font-semibold text-cream backdrop-blur transition hover:bg-white/15"
          >
            <Search className="h-4 w-4" /> Search
          </Link>
        </div>
      </div>
    </div>
  );
}
