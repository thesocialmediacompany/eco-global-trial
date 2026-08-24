"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitCancel() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
    >
      {pending ? "Cancelling…" : "Cancel order"}
    </button>
  );
}

/**
 * Shopify-style cancel dialog: opens a modal that captures a reason category and
 * an optional note, then submits them to the `cancelOrder` server action. Once
 * the order is cancelled the server revalidates and this button disappears, so
 * the modal doesn't need to close itself on success.
 */
export function CancelOrderDialog({
  action,
  orderNumber,
  hasCourier,
  reasons,
}: {
  action: (formData: FormData) => void | Promise<void>;
  orderNumber: number;
  hasCourier: boolean;
  reasons: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
      >
        Cancel order
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold text-purple-900">
              Cancel order #{orderNumber}
            </h3>
            <p className="mt-1 text-sm text-purple-900/60">
              This returns its items to stock
              {hasCourier ? " and cancels the courier booking" : ""}. This can&apos;t be undone.
            </p>

            <form action={action} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-purple-900">
                  Reason for cancellation
                </label>
                <select
                  name="reason"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-400 focus:outline-none"
                >
                  <option value="" disabled>
                    Select a reason…
                  </option>
                  {Object.entries(reasons).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-purple-900">
                  Note <span className="font-normal text-purple-900/50">(optional)</span>
                </label>
                <textarea
                  name="note"
                  rows={3}
                  maxLength={500}
                  placeholder="Add details for the record, e.g. customer called to cancel…"
                  className="w-full resize-none rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 placeholder:text-purple-900/35 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50"
                >
                  Keep order
                </button>
                <SubmitCancel />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
