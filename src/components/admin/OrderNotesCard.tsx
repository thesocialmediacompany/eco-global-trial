"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

/** Shopify's Notes card: reads as plain text until you click the pencil. */
export function OrderNotesCard({
  note,
  save,
}: {
  note: string;
  save: (formData: FormData) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-purple-900">Notes</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit notes"
            className="grid h-7 w-7 place-items-center rounded text-purple-900/45 hover:bg-purple-50 hover:text-purple-900"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <form
          action={async (fd) => {
            await save(fd);
            setEditing(false);
          }}
        >
          <textarea
            name="note"
            defaultValue={note}
            rows={4}
            autoFocus
            placeholder="Add a note about this order"
            className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-400"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-purple-200 px-3 py-1.5 text-sm font-medium text-purple-900 hover:bg-purple-50"
            >
              Cancel
            </button>
            <button className="rounded-lg gradient-purple-green px-3 py-1.5 text-sm font-semibold text-cream">
              Save
            </button>
          </div>
        </form>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-purple-900/70">
          {note || <span className="text-purple-900/45">No notes from customer</span>}
        </p>
      )}
    </div>
  );
}
