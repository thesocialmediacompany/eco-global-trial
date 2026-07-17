import { X } from "lucide-react";

/** Shopify's Tags card: free-form labels staff use to slice the orders list. */
export function OrderTagsCard({
  tags,
  add,
  remove,
}: {
  tags: string[];
  add: (formData: FormData) => Promise<void>;
  remove: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-display text-base font-semibold text-purple-900">Tags</h2>

      <form action={add}>
        <input
          name="tag"
          placeholder="Add a tag and press Enter"
          aria-label="Add a tag"
          className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-400"
        />
      </form>

      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <li key={t}>
              <form action={remove} className="contents">
                <input type="hidden" name="tag" value={t} />
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 py-1 pl-2.5 pr-1 text-xs font-medium text-purple-800">
                  {t}
                  <button
                    aria-label={`Remove tag ${t}`}
                    className="grid h-4 w-4 place-items-center rounded text-purple-900/40 hover:bg-purple-100 hover:text-purple-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
