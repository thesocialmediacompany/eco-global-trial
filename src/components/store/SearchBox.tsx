"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface Suggestion {
  slug: string;
  title: string;
  price: number;
  emoji: string;
  imageUrl: string | null;
}

export function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced typeahead.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        /* aborted / network — ignore */
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(term: string) {
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <div ref={boxRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-900/40" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for granola, oats, protein bars…"
          className="w-full rounded-full border border-purple-200 bg-white py-3.5 pl-12 pr-28 text-sm text-purple-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full gradient-purple-green px-5 py-2.5 text-sm font-semibold text-cream"
        >
          Search
        </button>
      </form>

      {open && results.length > 0 && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-xl">
          {results.map((r) => (
            <button
              key={r.slug}
              onClick={() => router.push(`/product/${r.slug}`)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-cream/60"
            >
              <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream text-lg">
                {r.imageUrl ? (
                  <Image src={r.imageUrl} alt={r.title} fill sizes="40px" className="object-cover" />
                ) : (
                  r.emoji
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-purple-900">
                  {r.title}
                </span>
                <span className="text-xs text-purple-900/50">{formatPKR(r.price)}</span>
              </span>
            </button>
          ))}
          <button
            onClick={() => go(q)}
            className="block w-full border-t border-purple-100 px-4 py-2.5 text-left text-sm font-medium text-green-700 hover:bg-cream/60"
          >
            See all results for &ldquo;{q}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
