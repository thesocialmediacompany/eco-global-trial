import { Trash2, Plus, Star, FileText, Images } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { GRADIENTS } from "@/data/gradients";
import { UploadField } from "@/components/admin/UploadField";
import {
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  addCatalog,
  updateCatalog,
  deleteCatalog,
} from "./actions";

export default async function MediaPage() {
  await requireOwner();
  const [gallery, catalogs, products] = await Promise.all([
    prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.catalogFile.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.product.findMany({
      where: { status: "active" },
      orderBy: { title: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  // reusable <option> list for the "link to product" pickers
  const productOptions = (
    <>
      <option value="">No link (decorative)</option>
      {products.map((p) => (
        <option key={p.slug} value={p.slug}>
          {p.title}
        </option>
      ))}
    </>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <div>
        <h1 className="font-display text-2xl font-semibold text-purple-900">Media &amp; gallery</h1>
        <p className="mt-1 text-sm text-purple-900/60">
          Manage the Our Story gallery, the homepage &ldquo;From our kitchen&rdquo; band and
          downloadable catalog PDFs. Leave a photo&apos;s image blank to use a styled placeholder.
        </p>
      </div>

      {/* ---- Gallery ---- */}
      <section className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-purple-900">
          <Images className="h-5 w-5 text-green-600" /> Gallery photos
          <span className="ml-1 text-sm font-normal text-purple-900/50">({gallery.length})</span>
        </h2>

        {gallery.length > 0 && (
          <div className="mb-6 space-y-3">
            {gallery.map((g) => (
              <div key={g.id} className="rounded-xl border border-purple-100 p-3">
                <div className="flex gap-3">
                  {/* thumbnail */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    {g.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.url} alt={g.caption} className="h-full w-full object-cover" />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center ${g.gradient}`}>
                        <span className="text-3xl">{g.emoji}</span>
                      </div>
                    )}
                    {g.featured && (
                      <span className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-gold-400 text-purple-900" title="On homepage band">
                        <Star className="h-3 w-3 fill-purple-900" />
                      </span>
                    )}
                  </div>

                  {/* edit form */}
                  <form action={updateGalleryImage.bind(null, g.id)} className="grid flex-1 gap-2 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Caption</span>
                      <input name="caption" defaultValue={g.caption} className={input} />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Links to product (click opens this)</span>
                      <select name="productSlug" defaultValue={g.productSlug} className={input}>
                        {productOptions}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Placeholder emoji</span>
                      <input name="emoji" defaultValue={g.emoji} className={input} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Placeholder colour</span>
                      <select name="gradient" defaultValue={g.gradient} className={input}>
                        {GRADIENTS.map((gr) => (
                          <option key={gr.value} value={gr.value}>{gr.label}</option>
                        ))}
                      </select>
                    </label>
                    <div className="sm:col-span-2">
                      <UploadField name="url" kind="image" label="Replace photo (leave blank to keep)" />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-purple-900">
                      <input type="checkbox" name="featured" defaultChecked={g.featured} className="h-4 w-4 accent-green-600" />
                      Show on homepage band
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Sort order</span>
                      <input name="sortOrder" type="number" defaultValue={g.sortOrder} className={input} />
                    </label>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <button className="rounded-lg gradient-purple-green px-4 py-1.5 text-sm font-semibold text-cream">
                        Save
                      </button>
                    </div>
                  </form>

                  {/* delete */}
                  <form action={deleteGalleryImage.bind(null, g.id)} className="shrink-0">
                    <button className="grid h-8 w-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Delete photo">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        <form action={addGalleryImage} className="rounded-xl border border-dashed border-purple-200 bg-cream/30 p-4">
          <p className="mb-3 text-sm font-semibold text-purple-900">Add a photo</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <UploadField name="url" kind="image" label="Photo (optional — blank = placeholder)" />
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Caption</span>
              <input name="caption" className={input} placeholder="e.g. Golden granola, fresh from the oven" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Links to product (optional — click opens this)</span>
              <select name="productSlug" defaultValue="" className={input}>
                {productOptions}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Placeholder emoji</span>
              <input name="emoji" defaultValue="🥣" className={input} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Placeholder colour</span>
              <select name="gradient" className={input} defaultValue="gradient-green">
                {GRADIENTS.map((gr) => (
                  <option key={gr.value} value={gr.value}>{gr.label}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-purple-900">
              <input type="checkbox" name="featured" className="h-4 w-4 accent-green-600" />
              Also show on homepage &ldquo;From our kitchen&rdquo; band
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Sort order</span>
              <input name="sortOrder" type="number" defaultValue={0} className={input} />
            </label>
          </div>
          <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">
            <Plus className="h-4 w-4" /> Add photo
          </button>
        </form>
      </section>

      {/* ---- Catalogs ---- */}
      <section className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-purple-900">
          <FileText className="h-5 w-5 text-green-600" /> Catalog PDFs
          <span className="ml-1 text-sm font-normal text-purple-900/50">({catalogs.length})</span>
        </h2>

        {catalogs.length > 0 && (
          <div className="mb-6 space-y-3">
            {catalogs.map((c) => (
              <div key={c.id} className="rounded-xl border border-purple-100 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600">
                      <FileText className="h-5 w-5" />
                    </span>
                    <p className="truncate text-xs text-purple-900/55">
                      Current file:{" "}
                      {c.fileUrl ? (
                        <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-green-700 hover:underline">
                          {c.fileUrl.split("/").pop()}
                        </a>
                      ) : (
                        "none yet"
                      )}
                      {c.sizeLabel && ` · ${c.sizeLabel}`}
                    </p>
                  </div>
                  <form action={deleteCatalog.bind(null, c.id)}>
                    <button className="grid h-8 w-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Delete catalog">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                <form action={updateCatalog.bind(null, c.id)} className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Title</span>
                    <input name="title" required defaultValue={c.title} className={input} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Short description</span>
                    <input name="description" defaultValue={c.description} className={input} />
                  </label>
                  <div className="sm:col-span-2">
                    <UploadField name="fileUrl" kind="pdf" label="Replace PDF (leave blank to keep current)" sizeName="sizeLabel" />
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Sort order</span>
                    <input name="sortOrder" type="number" defaultValue={c.sortOrder} className={input} />
                  </label>
                  <div className="flex items-end">
                    <button className="rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">
                      Save changes
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addCatalog} className="rounded-xl border border-dashed border-purple-200 bg-cream/30 p-4">
          <p className="mb-3 text-sm font-semibold text-purple-900">Add a catalog</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Title</span>
              <input name="title" required className={input} placeholder="e.g. Retail Range 2026" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Short description</span>
              <input name="description" className={input} placeholder="e.g. Our full retail catalogue" />
            </label>
            <div className="sm:col-span-2">
              <UploadField name="fileUrl" kind="pdf" label="PDF file" sizeName="sizeLabel" />
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Sort order</span>
              <input name="sortOrder" type="number" defaultValue={0} className={input} />
            </label>
          </div>
          <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">
            <Plus className="h-4 w-4" /> Add catalog
          </button>
        </form>
      </section>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";
