"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil, Loader2, Check, X, AlertCircle } from "lucide-react";
import { DELIVERY_CITIES } from "@/lib/cities";
import type { DeliveryUpdateState } from "@/app/admin/(panel)/orders/actions";

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </>
      ) : (
        "Save & update"
      )}
    </button>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

export function EditDeliveryCard({
  customerName,
  phone,
  address,
  city,
  action,
}: {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  action: (prev: DeliveryUpdateState, fd: FormData) => Promise<DeliveryUpdateState>;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(action, { ok: false });

  // Close the editor after a successful save (the page revalidates with the
  // new values). Runs on each fresh result object, not on re-open.
  useEffect(() => {
    if (state.ok) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-800 hover:bg-purple-50"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit delivery details
        </button>
        {state.ok && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-green-700">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-3 rounded-lg border border-purple-100 bg-cream/40 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-purple-900/50">
          Edit delivery details
        </span>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="grid h-6 w-6 place-items-center rounded text-purple-900/40 hover:bg-purple-100"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-purple-900/70">Name</span>
        <input name="customerName" defaultValue={customerName} className={input} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-purple-900/70">Phone</span>
        <input name="phone" defaultValue={phone} placeholder="03001234567" className={input} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-purple-900/70">Address</span>
        <textarea name="address" defaultValue={address} rows={2} className={input} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-purple-900/70">
          Delivery city <span className="text-purple-900/40">(must be a courier city)</span>
        </span>
        <input
          name="city"
          defaultValue={city}
          list="egf-delivery-cities"
          placeholder="Start typing…"
          className={input}
          autoComplete="off"
        />
        <datalist id="egf-delivery-cities">
          {DELIVERY_CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>

      {state.error && (
        <p className="flex items-start gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <SaveBtn />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs font-medium text-purple-900/60 hover:text-purple-900"
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-purple-900/45">
        After saving, click <strong>Fulfil</strong> again to book the courier.
      </p>
    </form>
  );
}
