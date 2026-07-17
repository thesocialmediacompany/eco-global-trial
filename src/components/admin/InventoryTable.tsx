"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Check, Save } from "lucide-react";
import { saveInventory } from "@/app/admin/(panel)/inventory/actions";

export interface InvRow {
  id: string;
  qty: number;
  variantTitle: string;
  sku: string;
  productTitle: string;
  imageUrl: string;
  emoji: string;
  gradient: string;
  /** first variant of its product - only this row shows the product name/image */
  first: boolean;
}

/**
 * Stock editor. Tracks which rows were actually edited and sends ONLY those on
 * save, so the request stays small (the old version posted all 269 variants and
 * was blocked by the WAF's 8 KB body limit).
 */
export function InventoryTable({ rows }: { rows: InvRow[] }) {
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [pending, start] = useTransition();
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const dirty = Object.keys(edits).length;

  function change(id: string, raw: string, original: number) {
    setEdits((prev) => {
      const next = { ...prev };
      const n = Math.max(0, Math.round(Number(raw)));
      if (raw === "" || Number.isNaN(n) || n === original) delete next[id];
      else next[id] = n;
      return next;
    });
  }

  function save() {
    if (!dirty || pending) return;
    const changes = Object.entries(edits).map(([id, qty]) => ({ id, qty }));
    start(async () => {
      const res = await saveInventory(changes);
      setEdits({});
      setSavedCount(res?.saved ?? changes.length);
      setTimeout(() => setSavedCount(null), 2500);
    });
  }

  return (
    <>
      {/* save bar */}
      <div className="mb-3 flex items-center justify-end gap-3">
        {savedCount !== null && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
            <Check className="h-4 w-4" /> Saved {savedCount} change{savedCount === 1 ? "" : "s"}
          </span>
        )}
        {dirty > 0 && (
          <span className="text-sm text-purple-900/60">
            {dirty} unsaved change{dirty === 1 ? "" : "s"}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="inline-flex items-center gap-2 rounded-lg gradient-purple-green px-5 py-2 text-sm font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Variant</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 text-right font-medium">In stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-purple-900/50">
                    No products match your search.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const value = edits[r.id] ?? r.qty;
                const isDirty = edits[r.id] !== undefined;
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-purple-50 last:border-0 hover:bg-cream/40 ${
                      r.first ? "border-t border-t-purple-100" : ""
                    }`}
                  >
                    <td className="px-5 py-2.5">
                      {r.first ? (
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md text-base ${
                              r.imageUrl ? "bg-white" : r.gradient
                            }`}
                          >
                            {r.imageUrl ? (
                              <Image src={r.imageUrl} alt="" fill sizes="32px" className="object-cover" />
                            ) : (
                              r.emoji
                            )}
                          </span>
                          <span className="font-medium text-purple-900">{r.productTitle}</span>
                        </div>
                      ) : (
                        // continuation row: show a muted tie-in instead of a blank cell
                        <span className="ml-4 border-l border-purple-100 pl-4 text-xs text-purple-900/35">
                          {r.productTitle}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-purple-900/70">{r.variantTitle}</td>
                    <td className="px-5 py-2.5 font-mono text-xs text-purple-900/50">{r.sku || " - "}</td>
                    <td className="px-5 py-2.5 text-right">
                      <input
                        type="number"
                        min={0}
                        value={value}
                        onChange={(e) => change(r.id, e.target.value, r.qty)}
                        className={`w-24 rounded-lg border px-3 py-1.5 text-right text-sm outline-none focus:ring-2 focus:ring-purple-100 ${
                          isDirty
                            ? "border-purple-400 bg-purple-50 font-semibold text-purple-900"
                            : value === 0
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : value <= 10
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-purple-100 text-purple-900"
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
