"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront error:", error);
  }, [error]);

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-5 py-24 text-center">
      <div>
        <span className="text-6xl">🌧️</span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-purple-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-purple-900/60">
          Sorry about that. The page hit an unexpected error. Please try again, or
          head back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full gradient-purple-green px-6 py-3 text-sm font-semibold text-cream"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-purple-200 px-6 py-3 text-sm font-semibold text-purple-900 hover:bg-purple-50"
          >
            <Home className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
