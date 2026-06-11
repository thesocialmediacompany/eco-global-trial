"use client";

import { useActionState, useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import {
  subscribeReorder,
  type ReorderState,
} from "@/app/(store)/newsletter/reorder-actions";

/**
 * "Subscribe & Save" opt-in. Cash-on-delivery can't do recurring billing, so
 * this signs the customer up for a friendly reorder reminder every few weeks
 * instead of auto-charging them.
 */
export function SubscribeSave({
  productSlug,
  productTitle,
}: {
  productSlug: string;
  productTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ReorderState, FormData>(
    subscribeReorder,
    {},
  );

  return (
    <div className="mt-4 rounded-2xl border border-green-200 bg-green-50/50 p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left text-sm font-semibold text-green-800"
      >
        <RefreshCw className="h-4 w-4" />
        Subscribe &amp; Save — never run out
      </button>

      {open && !state.ok && (
        <form action={formAction} className="mt-3 space-y-2">
          <input type="hidden" name="productSlug" value={productSlug} />
          <input type="hidden" name="productTitle" value={productTitle} />
          <p className="text-xs text-green-900/70">
            We&apos;ll remind you to reorder (no auto-charge — you pay by Cash on
            Delivery as usual).
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="flex-1 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-green-400"
            />
            <select
              name="frequencyWeeks"
              defaultValue="4"
              className="rounded-lg border border-green-200 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-green-400"
            >
              <option value="2">Every 2 weeks</option>
              <option value="4">Every month</option>
              <option value="8">Every 2 months</option>
            </select>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream disabled:opacity-60"
            >
              {pending ? "Saving…" : "Remind me"}
            </button>
          </div>
          {state.error && <p className="text-xs text-rose-600">{state.error}</p>}
        </form>
      )}

      {state.ok && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
          <Check className="h-4 w-4" /> Done — we&apos;ll remind you to reorder {productTitle}.
        </p>
      )}
    </div>
  );
}
