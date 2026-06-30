import { LayoutTemplate } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { HERO_PAGES } from "@/lib/page-hero";
import { GRADIENTS } from "@/data/gradients";
import { MultiImageField } from "@/components/admin/MultiImageField";
import { savePageHero } from "./actions";

export default async function PageCoversPage() {
  await requireOwner();
  const rows = await prisma.pageHero.findMany();
  const byKey = new Map(rows.map((r) => [r.pageKey, r]));

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-purple-900">
          <LayoutTemplate className="h-6 w-6 text-green-600" /> Page covers
        </h1>
        <p className="mt-1 text-sm text-purple-900/60">
          Give each main page a cover: a colour gradient (optionally a slow
          &ldquo;running&rdquo; animation) or 1&ndash;5 photos that auto-slide. Add photos and
          set the mode to <strong>Photo slider</strong> to use them.
        </p>
      </div>

      {HERO_PAGES.map((p) => {
        const r = byKey.get(p.key);
        return (
          <form
            key={p.key}
            action={savePageHero.bind(null, p.key)}
            className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 font-display text-lg font-semibold text-purple-900">{p.label}</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Cover type</span>
                <select name="mode" defaultValue={r?.mode ?? "gradient"} className={input}>
                  <option value="gradient">Colour gradient</option>
                  <option value="slider">Photo slider</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Gradient (when no photos)</span>
                <select name="gradient" defaultValue={r?.gradient ?? "gradient-purple-green"} className={input}>
                  {GRADIENTS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-purple-900">
                <input type="checkbox" name="animated" defaultChecked={r?.animated ?? false} className="h-4 w-4 accent-green-600" />
                Running (animated) gradient
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Slide every (seconds)</span>
                <input
                  name="autoplaySec"
                  type="number"
                  min={2}
                  defaultValue={r ? Math.round(r.autoplayMs / 1000) : 5}
                  className={`${input} w-28`}
                />
              </label>
            </div>

            <div className="mt-4">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Cover photos (up to 5)</span>
              <MultiImageField name="images" defaultImages={r?.images ?? ""} max={5} />
            </div>

            <button className="mt-4 rounded-lg gradient-purple-green px-5 py-2 text-sm font-semibold text-cream">
              Save {p.label} cover
            </button>
          </form>
        );
      })}
    </div>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";
