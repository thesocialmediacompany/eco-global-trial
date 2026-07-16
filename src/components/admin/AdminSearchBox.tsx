"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Package, Users, ShoppingCart, Loader2, CornerDownLeft } from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface Results {
  products: { id: string; slug: string; title: string; imageUrl: string; price: number }[];
  customers: { id: string; name: string; email: string }[];
  orders: { id: string; orderNumber: number; customerName: string; total: number; fulfillmentStatus: string }[];
}
type Item = { href: string; kind: "product" | "customer" | "order"; node: React.ReactNode };

/**
 * Live admin search: results appear as you type (products, customers, orders),
 * each opening its record directly. Enter (or "View all") opens the full search
 * page. Focus with the search box, ⌘K / Ctrl-K, or "/".
 */
export function AdminSearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced fetch.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          setResults(await res.json());
          setOpen(true);
          setActive(0);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Global focus shortcuts: ⌘K / Ctrl-K, and "/".
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      const typing = tag === "input" || tag === "textarea";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const items: Item[] = useMemo(() => {
    if (!results) return [];
    const out: Item[] = [];
    for (const p of results.products)
      out.push({
        href: `/admin/products/${p.id}`,
        kind: "product",
        node: (
          <>
            <span className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md bg-purple-50 text-purple-900/40">
              {p.imageUrl ? (
                <Image src={p.imageUrl} alt="" fill sizes="32px" className="object-cover" />
              ) : (
                <Package className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate text-purple-900">{p.title}</span>
            <span className="text-xs text-purple-900/60">{formatPKR(p.price)}</span>
          </>
        ),
      });
    for (const c of results.customers)
      out.push({
        href: `/admin/customers/${c.id}`,
        kind: "customer",
        node: (
          <>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-purple-50 text-purple-900/50">
              <Users className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-purple-900">
              {c.name} <span className="text-purple-900/45">· {c.email}</span>
            </span>
          </>
        ),
      });
    for (const o of results.orders)
      out.push({
        href: `/admin/orders/${o.id}`,
        kind: "order",
        node: (
          <>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-purple-50 text-purple-900/50">
              <ShoppingCart className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-purple-900">
              #{o.orderNumber} · {o.customerName}
            </span>
            <span className="text-xs text-purple-900/60">{formatPKR(o.total)}</span>
          </>
        ),
      });
    return out;
  }, [results]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    setResults(null);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && items[active]) go(items[active].href);
      else if (query.trim()) go(`/admin/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const empty =
    results && results.products.length + results.customers.length + results.orders.length === 0;

  return (
    <div ref={boxRef} className="relative flex-1 max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-900/40" />
      <input
        ref={inputRef}
        type="search"
        placeholder="Search products, customers, orders…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => results && setOpen(true)}
        className="w-full rounded-lg border border-purple-100 bg-cream/60 py-2 pl-9 pr-14 text-sm text-purple-900 outline-none transition focus:border-purple-300 focus:bg-white"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-purple-100 bg-white px-1.5 py-0.5 text-[0.65rem] font-medium text-purple-900/40 sm:block">
        ⌘K
      </kbd>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-[70vh] overflow-y-auto rounded-xl border border-purple-100 bg-white py-1.5 shadow-xl">
          {loading && !results ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-purple-900/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          ) : empty ? (
            <div className="px-4 py-3 text-sm text-purple-900/50">
              No matches for “{query.trim()}”.
            </div>
          ) : (
            items.map((it, i) => (
              <button
                key={it.href}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(it.href)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm ${
                  i === active ? "bg-purple-50" : "hover:bg-cream/60"
                }`}
              >
                {it.node}
              </button>
            ))
          )}

          {!empty && (
            <button
              type="button"
              onClick={() => go(`/admin/search?q=${encodeURIComponent(query.trim())}`)}
              className="mt-1 flex w-full items-center gap-2 border-t border-purple-50 px-4 py-2 text-left text-xs font-medium text-green-700 hover:bg-cream/60"
            >
              <CornerDownLeft className="h-3.5 w-3.5" /> View all results for “{query.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
