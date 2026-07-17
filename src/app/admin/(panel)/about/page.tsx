import { Plus, Trash2, ChevronUp, ChevronDown, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { ABOUT_GRIDS, ABOUT_ICON_KEYS, aboutIcon } from "@/lib/about-icons";
import {
  createAboutItem,
  updateAboutItem,
  deleteAboutItem,
  moveAboutItem,
} from "./actions";

export const metadata = { title: "About page" };

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

export default async function AdminAboutPage() {
  await requireOwner();
  const items = await prisma.aboutItem.findMany({
    orderBy: [{ grid: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <h1 className="font-display text-2xl font-semibold text-purple-900">About page</h1>
      <p className="mt-1 text-sm text-purple-900/60">
        The card grids on your Our Story page. The intro, Mission and Concept text live in{" "}
        <strong>Settings → About page</strong>.
      </p>

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-purple-100 bg-cream/50 p-3 text-xs text-purple-900/70">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
        Icons come from a fixed set so the page always looks right. A grid with no
        items simply hides that section on the site.
      </p>

      <div className="mt-6 space-y-6">
        {ABOUT_GRIDS.map((grid) => {
          const rows = items.filter((i) => i.grid === grid.key);
          return (
            <section
              key={grid.key}
              className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-purple-900">
                {grid.label}
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                  {rows.length}
                </span>
              </h2>

              <div className="space-y-3">
                {rows.length === 0 && (
                  <p className="rounded-lg border border-dashed border-purple-200 px-4 py-6 text-center text-sm text-purple-900/45">
                    No items yet — this section is hidden on the site.
                  </p>
                )}

                {rows.map((it, idx) => {
                  const Icon = aboutIcon(it.icon);
                  return (
                    <div
                      key={it.id}
                      className={`rounded-xl border p-4 ${
                        it.active ? "border-purple-100" : "border-purple-100 bg-cream/40 opacity-60"
                      }`}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        {grid.hasIcon && (
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-purple-green text-cream">
                            <Icon className="h-4 w-4" />
                          </span>
                        )}
                        {grid.hasYear && (
                          <span className="rounded-md bg-purple-50 px-2 py-1 font-display text-sm font-semibold text-purple-800">
                            {it.year || "—"}
                          </span>
                        )}
                        <span className="flex-1 truncate text-sm font-medium text-purple-900">
                          {it.title}
                        </span>

                        {/* reorder + delete */}
                        <form action={moveAboutItem}>
                          <input type="hidden" name="id" value={it.id} />
                          <input type="hidden" name="dir" value="up" />
                          <button
                            disabled={idx === 0}
                            className="grid h-7 w-7 place-items-center rounded text-purple-900/50 hover:bg-purple-50 disabled:opacity-25"
                            aria-label="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                        </form>
                        <form action={moveAboutItem}>
                          <input type="hidden" name="id" value={it.id} />
                          <input type="hidden" name="dir" value="down" />
                          <button
                            disabled={idx === rows.length - 1}
                            className="grid h-7 w-7 place-items-center rounded text-purple-900/50 hover:bg-purple-50 disabled:opacity-25"
                            aria-label="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </form>
                        <form action={deleteAboutItem}>
                          <input type="hidden" name="id" value={it.id} />
                          <button
                            className="grid h-7 w-7 place-items-center rounded text-rose-600 hover:bg-rose-50"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>

                      <form action={updateAboutItem} className="grid gap-3 sm:grid-cols-[160px_1fr]">
                        <input type="hidden" name="id" value={it.id} />
                        {grid.hasIcon ? (
                          <label className="block">
                            <span className="mb-1 block text-xs font-medium text-purple-900/60">Icon</span>
                            <select name="icon" defaultValue={it.icon} className={input}>
                              {ABOUT_ICON_KEYS.map((k) => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <label className="block">
                            <span className="mb-1 block text-xs font-medium text-purple-900/60">Year</span>
                            <input name="year" defaultValue={it.year} className={input} />
                          </label>
                        )}
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-purple-900/60">Title</span>
                          <input name="title" defaultValue={it.title} className={input} required />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="mb-1 block text-xs font-medium text-purple-900/60">Text</span>
                          <textarea name="body" rows={2} defaultValue={it.body} className={input} />
                        </label>
                        <div className="flex items-center justify-between sm:col-span-2">
                          <label className="flex items-center gap-2 text-sm text-purple-900/70">
                            <input
                              type="checkbox"
                              name="active"
                              defaultChecked={it.active}
                              className="h-4 w-4 accent-green-600"
                            />
                            Show on site
                          </label>
                          <button className="rounded-lg border border-purple-200 px-4 py-1.5 text-sm font-semibold text-purple-900 hover:bg-purple-50">
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                })}
              </div>

              {/* add new */}
              <form
                action={createAboutItem}
                className="mt-4 grid gap-3 rounded-xl border border-dashed border-purple-200 bg-cream/30 p-4 sm:grid-cols-[160px_1fr_auto]"
              >
                <input type="hidden" name="grid" value={grid.key} />
                {grid.hasIcon ? (
                  <select name="icon" defaultValue={ABOUT_ICON_KEYS[0]} className={input}>
                    {ABOUT_ICON_KEYS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                ) : (
                  <input name="year" placeholder="Year" className={input} />
                )}
                <input name="title" placeholder="New item title" className={input} required />
                <button className="inline-flex items-center justify-center gap-1.5 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">
                  <Plus className="h-4 w-4" /> Add
                </button>
                <textarea
                  name="body"
                  rows={2}
                  placeholder="Short description"
                  className={`${input} sm:col-span-3`}
                />
              </form>
            </section>
          );
        })}
      </div>
    </div>
  );
}
