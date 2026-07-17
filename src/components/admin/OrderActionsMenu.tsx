"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface OrderMenuAction {
  label: string;
  /** a bound server action */
  action: () => Promise<void>;
  danger?: boolean;
}

/**
 * Shopify's "More actions" dropdown.
 *
 * Anchored right against a button that sits at the right edge of the page, so a
 * fixed-width panel opening leftwards always has room. Unlike the nav mega menu
 * this cannot be triggered from an arbitrary position, so plain `right-0` is
 * safe here.
 */
export function OrderActionsMenu({ actions }: { actions: OrderMenuAction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (actions.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50"
      >
        More actions <ChevronDown className="h-4 w-4 text-purple-900/50" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-purple-100 bg-white py-1 shadow-lg"
        >
          {actions.map((a) => (
            <form key={a.label} action={a.action}>
              <button
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 ${
                  a.danger ? "text-rose-600 hover:bg-rose-50" : "text-purple-900"
                }`}
              >
                {a.label}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
