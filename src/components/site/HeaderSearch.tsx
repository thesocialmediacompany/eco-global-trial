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

/**
 * Header quick-search: click the icon (or press "/") to open a live typeahead
 * that shows matching products as you type, each linking straight to its page.
 * "See all results" opens the full /search page. Reuses /api/search.
 */
export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [showResults, setShowResults] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Debounced typeahead.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setShowResults(false);
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
        setShowResults(true);
      } catch {
        /* aborted / network — ignore */
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Outside click + Escape to close, "/" to open.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "/" && tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function go(path: string) {
    setOpen(false);
    setQ("");
    setResults([]);
    router.push(path);
  }

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Search"
        onClick={() => setOpen((v) => !v)}
        className="grid h-10 w-10 place-items-center rounded-full text-purple-900 transition-colors hover:bg-purple-100"
      >
        <Search className="h-[1.15rem] w-[1.15rem]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(92vw,420px)] rounded-2xl border border-purple-100 bg-white p-2 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-900/40" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for granola, oats, protein bars…"
              className="w-full rounded-full border border-purple-200 bg-cream/50 py-2.5 pl-9 pr-3 text-sm text-purple-900 outline-none transition focus:border-purple-400 focus:bg-white"
            />
          </form>

          {showResults && (
            <div className="mt-1.5 max-h-[60vh] overflow-y-auto">
              {results.length > 0 ? (
                <>
                  {results.map((r) => (
                    <button
                      key={r.slug}
                      onClick={() => go(`/product/${r.slug}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-cream/60"
                    >
                      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream text-base">
                        {r.imageUrl ? (
                          <Image src={r.imageUrl} alt={r.title} fill sizes="36px" className="object-cover" />
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
                    onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}
                    className="mt-1 block w-full rounded-lg border-t border-purple-50 px-3 py-2 text-left text-sm font-medium text-green-700 hover:bg-cream/60"
                  >
                    See all results for &ldquo;{q.trim()}&rdquo;
                  </button>
                </>
              ) : (
                <p className="px-3 py-3 text-sm text-purple-900/50">
                  No matches for &ldquo;{q.trim()}&rdquo;.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
