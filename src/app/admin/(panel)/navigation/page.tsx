import { Trash2, Plus, Navigation as NavIcon, GripVertical } from "lucide-react";
import { requireOwner } from "@/lib/admin-guard";
import { getAllNavLinks } from "@/lib/navigation";
import { addNavLink, updateNavLink, deleteNavLink } from "./actions";

type Row = {
  id: string;
  label: string;
  href: string;
  mega: boolean;
  enabled: boolean;
  sortOrder: number;
};

export default async function NavigationPage() {
  await requireOwner();
  const groups = await getAllNavLinks();

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-purple-900">
          <NavIcon className="h-6 w-6 text-green-600" /> Navigation
        </h1>
        <p className="mt-1 text-sm text-purple-900/60">
          Edit the header menu and the footer link columns. Use a path like{" "}
          <code>/shop</code> or <code>/category/horeca</code> for internal links, or a full
          <code> https://…</code> URL for external ones. Lower &ldquo;order&rdquo; shows first.
        </p>
      </div>

      <MenuSection
        title="Header menu"
        location="header"
        rows={groups.header}
        showMega
      />
      <MenuSection title="Footer — Shop column" location="footer_shop" rows={groups.footer_shop} />
      <MenuSection title="Footer — Company column" location="footer_company" rows={groups.footer_company} />
    </div>
  );
}

function MenuSection({
  title,
  location,
  rows,
  showMega = false,
}: {
  title: string;
  location: string;
  rows: Row[];
  showMega?: boolean;
}) {
  return (
    <section className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-lg font-semibold text-purple-900">
        {title} <span className="text-sm font-normal text-purple-900/50">({rows.length})</span>
      </h2>

      <div className="space-y-2">
        {rows.map((r) => (
          <form
            key={r.id}
            action={updateNavLink.bind(null, r.id)}
            className="flex flex-wrap items-end gap-2 rounded-lg border border-purple-100 bg-cream/30 p-2.5"
          >
            <GripVertical className="mb-2 hidden h-4 w-4 shrink-0 text-purple-900/30 sm:block" />
            <label className="block">
              <span className="mb-1 block text-[0.65rem] font-medium text-purple-900/50">Label</span>
              <input name="label" defaultValue={r.label} className={`${input} w-36`} />
            </label>
            <label className="block flex-1">
              <span className="mb-1 block text-[0.65rem] font-medium text-purple-900/50">Link / URL</span>
              <input name="href" defaultValue={r.href} className={`${input} w-full min-w-40`} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[0.65rem] font-medium text-purple-900/50">Order</span>
              <input name="sortOrder" type="number" defaultValue={r.sortOrder} className={`${input} w-16`} />
            </label>
            <label className="flex items-center gap-1.5 pb-2 text-xs text-purple-900">
              <input type="checkbox" name="enabled" defaultChecked={r.enabled} className="h-4 w-4 accent-green-600" />
              Show
            </label>
            {showMega && (
              <label className="flex items-center gap-1.5 pb-2 text-xs text-purple-900" title="Show the categories mega-menu on hover">
                <input type="checkbox" name="mega" defaultChecked={r.mega} className="h-4 w-4 accent-green-600" />
                Mega
              </label>
            )}
            <button className="mb-0.5 rounded-lg gradient-purple-green px-3 py-2 text-xs font-semibold text-cream">
              Save
            </button>
            <button
              formAction={deleteNavLink.bind(null, r.id)}
              className="mb-0.5 grid h-9 w-9 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
              aria-label="Delete link"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        ))}
      </div>

      {/* add */}
      <form
        action={addNavLink}
        className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-purple-200 p-2.5"
      >
        <input type="hidden" name="location" value={location} />
        <label className="block">
          <span className="mb-1 block text-[0.65rem] font-medium text-purple-900/50">Label</span>
          <input name="label" required placeholder="e.g. Gifting" className={`${input} w-36`} />
        </label>
        <label className="block flex-1">
          <span className="mb-1 block text-[0.65rem] font-medium text-purple-900/50">Link / URL</span>
          <input name="href" required placeholder="/category/gifting" className={`${input} w-full min-w-40`} />
        </label>
        {showMega && (
          <label className="flex items-center gap-1.5 pb-2 text-xs text-purple-900">
            <input type="checkbox" name="mega" className="h-4 w-4 accent-green-600" /> Mega
          </label>
        )}
        <button className="mb-0.5 inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-3.5 py-2 text-xs font-semibold text-cream">
          <Plus className="h-4 w-4" /> Add link
        </button>
      </form>
    </section>
  );
}

const input =
  "rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";
