"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Variant = {
  id?: string;
  title: string;
  price?: number | null;
  inventoryQty: number;
  weightGrams?: number;
};

type Collection = { id: string; name: string };

type ProductData = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  status: string;
  emoji: string;
  gradient: string;
  imageUrl: string;
  images: string;
  badges: string;
  price: number;
  compareAtPrice: number | null;
  vendor: string;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  collectionId: string | null;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ingredients: string;
  allergens: string;
  nutrition: { label: string; value: string }[];
  variants: Variant[];
};

const gradientOptions = [
  { value: "gradient-purple", label: "Purple" },
  { value: "gradient-green", label: "Green" },
  { value: "gradient-purple-green", label: "Purple → Green" },
];

export function ProductForm({
  action,
  product,
  collections,
  defaultCollectionId,
}: {
  action: (formData: FormData) => Promise<void>;
  product?: ProductData;
  collections: Collection[];
  /** Pre-selected collection for new products (e.g. the HORECA tab). */
  defaultCollectionId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.length
      ? product.variants
      : [{ title: "Default", inventoryQty: 0, weightGrams: 0 }],
  );
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? "");
  const [emoji, setEmoji] = useState(product?.emoji ?? "🌿");
  const [gradient, setGradient] = useState(product?.gradient ?? "gradient-purple");
  const [nutrition, setNutrition] = useState<{ label: string; value: string }[]>(
    product?.nutrition?.length ? product.nutrition : [],
  );

  function updateVariant(i: number, patch: Partial<Variant>) {
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }
  function addVariant() {
    setVariants((vs) => [...vs, { title: "", inventoryQty: 0, weightGrams: 0 }]);
  }
  function removeVariant(i: number) {
    setVariants((vs) => vs.filter((_, idx) => idx !== i));
  }
  function updateNutrition(i: number, patch: Partial<{ label: string; value: string }>) {
    setNutrition((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addNutrition() {
    setNutrition((rows) => [...rows, { label: "", value: "" }]);
  }
  function removeNutrition(i: number) {
    setNutrition((rows) => rows.filter((_, idx) => idx !== i));
  }

  return (
    <form action={action} className="mx-auto max-w-5xl pb-24">
      {/* hidden serialized variants */}
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="emoji" value={emoji} />
      <input type="hidden" name="gradient" value={gradient} />
      <input
        type="hidden"
        name="nutritionJson"
        value={JSON.stringify(nutrition.filter((r) => r.label.trim() || r.value.trim()))}
      />

      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="grid h-9 w-9 place-items-center rounded-lg border border-purple-100 bg-white text-purple-900/70 hover:bg-purple-50"
            aria-label="Back"
          >
            <X className="h-4 w-4" />
          </button>
          <h1 className="font-display text-xl font-semibold text-purple-900">
            {isEdit ? product?.title : "New product"}
          </h1>
        </div>
        <SubmitButton />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-6">
          <Card>
            <Field label="Title">
              <input
                name="title"
                required
                defaultValue={product?.title}
                placeholder="e.g. Granola Goodness - Chocolate"
                className={inputCls}
              />
            </Field>
            <Field label="Tagline">
              <input
                name="tagline"
                defaultValue={product?.tagline}
                placeholder="Short marketing line"
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <textarea
                name="description"
                defaultValue={product?.description}
                rows={5}
                className={inputCls}
              />
            </Field>
          </Card>

          {/* Pricing */}
          <Card title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (PKR)">
                <input
                  name="price"
                  type="number"
                  min={0}
                  required
                  defaultValue={product?.price ?? 0}
                  className={inputCls}
                />
              </Field>
              <Field label="Compare-at price (PKR)">
                <input
                  name="compareAtPrice"
                  type="number"
                  min={0}
                  defaultValue={product?.compareAtPrice ?? undefined}
                  placeholder="Optional"
                  className={inputCls}
                />
              </Field>
            </div>
          </Card>

          {/* Media */}
          <Card title="Media">
            <ImageUploader
              defaultImageUrl={product?.imageUrl}
              defaultImages={product?.images}
            />
          </Card>

          {/* Variants */}
          <Card title="Variants (flavours / sizes)">
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_88px_80px_88px_auto] items-end gap-2"
                >
                  <Field label={i === 0 ? "Name" : ""}>
                    <input
                      value={v.title}
                      onChange={(e) => updateVariant(i, { title: e.target.value })}
                      placeholder="e.g. Chocolate"
                      className={inputCls}
                    />
                  </Field>
                  <Field label={i === 0 ? "Price" : ""}>
                    <input
                      type="number"
                      min={0}
                      value={v.price ?? ""}
                      onChange={(e) =>
                        updateVariant(i, {
                          price: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="Base"
                      className={inputCls}
                    />
                  </Field>
                  <Field label={i === 0 ? "Stock" : ""}>
                    <input
                      type="number"
                      min={0}
                      value={v.inventoryQty}
                      onChange={(e) =>
                        updateVariant(i, { inventoryQty: Number(e.target.value) })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label={i === 0 ? "Weight (g)" : ""}>
                    <input
                      type="number"
                      min={0}
                      value={v.weightGrams ?? 0}
                      onChange={(e) =>
                        updateVariant(i, { weightGrams: Number(e.target.value) })
                      }
                      title="Net weight in grams (used for shipping)"
                      className={inputCls}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="mb-1 grid h-9 w-9 place-items-center rounded-lg text-purple-900/40 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove variant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
            >
              <Plus className="h-4 w-4" /> Add variant
            </button>
          </Card>

          {/* Nutrition & ingredients */}
          <Card title="Nutrition & ingredients">
            <Field label="Ingredients">
              <textarea
                name="ingredients"
                defaultValue={product?.ingredients}
                rows={3}
                placeholder="Whole grain oats, honey, almonds, sunflower oil…"
                className={inputCls}
              />
            </Field>
            <Field label="Allergens (comma-separated)">
              <input
                name="allergens"
                defaultValue={product?.allergens}
                placeholder="Nuts, Gluten, Milk"
                className={inputCls}
              />
            </Field>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
                Nutrition facts (per serving / 100g)
              </span>
              <div className="space-y-2">
                {nutrition.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                    <input
                      value={row.label}
                      onChange={(e) => updateNutrition(i, { label: e.target.value })}
                      placeholder="Energy"
                      className={inputCls}
                    />
                    <input
                      value={row.value}
                      onChange={(e) => updateNutrition(i, { value: e.target.value })}
                      placeholder="380 kcal"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => removeNutrition(i)}
                      className="grid h-9 w-9 place-items-center rounded-lg text-purple-900/40 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addNutrition}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
              >
                <Plus className="h-4 w-4" /> Add nutrition row
              </button>
            </div>
          </Card>

          {/* SEO */}
          <Card title="Search engine listing">
            <p className="-mt-1 mb-3 text-xs text-purple-900/50">
              How this product appears in Google search results.
            </p>
            {/* live preview */}
            <div className="mb-4 rounded-lg border border-purple-100 bg-cream/40 p-4">
              <p className="truncate text-[0.7rem] text-green-700">
                ecoglobalfoods.com › products › {product?.id ? "…" : "new"}
              </p>
              <p className="truncate text-base text-[#1a0dab]">
                {seoTitle || product?.title || "Product title"}
              </p>
              <p className="line-clamp-2 text-sm text-purple-900/70">
                {seoDescription ||
                  "Add a description to control how this product appears in search."}
              </p>
            </div>
            <Field label="Page title">
              <input
                name="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                maxLength={70}
                className={inputCls}
              />
              <Hint>{seoTitle.length}/70</Hint>
            </Field>
            <Field label="Meta description">
              <textarea
                name="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                maxLength={160}
                className={inputCls}
              />
              <Hint>{seoDescription.length}/160</Hint>
            </Field>
            <Field label="Keywords (comma-separated)">
              <input
                name="seoKeywords"
                defaultValue={product?.seoKeywords}
                className={inputCls}
              />
            </Field>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          <Card title="Status">
            <select name="status" defaultValue={product?.status ?? "active"} className={inputCls}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </Card>

          <Card title="Organization">
            <Field label="Collection">
              <select
                name="collectionId"
                defaultValue={product?.collectionId ?? defaultCollectionId ?? ""}
                className={inputCls}
              >
                <option value="">No collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Vendor">
              <input
                name="vendor"
                defaultValue={product?.vendor ?? "Eco Global Foods"}
                className={inputCls}
              />
            </Field>
            <Field label="Badges (comma-separated)">
              <input name="badges" defaultValue={product?.badges} className={inputCls} />
            </Field>
            <label className="mt-1 flex items-center gap-2 text-sm text-purple-900/80">
              <input
                type="checkbox"
                name="isNew"
                defaultChecked={product?.isNew}
                className="h-4 w-4 rounded accent-green-600"
              />
              New arrival
            </label>
            <label className="flex items-center gap-2 text-sm text-purple-900/80">
              <input
                type="checkbox"
                name="isBestseller"
                defaultChecked={product?.isBestseller}
                className="h-4 w-4 rounded accent-green-600"
              />
              Bestseller
            </label>
            <label className="flex items-center gap-2 text-sm text-purple-900/80">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product?.isFeatured}
                className="h-4 w-4 rounded accent-green-600"
              />
              ⭐ Featured on homepage
            </label>
          </Card>

          <Card title="Appearance">
            <Field label="Emoji / pack art">
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className={`${inputCls} text-center text-2xl`}
              />
            </Field>
            <Field label="Card gradient">
              <select
                value={gradient}
                onChange={(e) => setGradient(e.target.value)}
                className={inputCls}
              >
                {gradientOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className={`mt-2 grid h-24 place-items-center rounded-lg text-4xl ${gradient}`}>
              {emoji}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg gradient-purple-green px-5 py-2 text-sm font-semibold text-cream shadow-sm transition hover:opacity-95 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
      {title && (
        <h2 className="mb-4 font-display text-base font-semibold text-purple-900">
          {title}
        </h2>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
          {label}
        </span>
      )}
      {children}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <span className="mt-1 block text-right text-[0.7rem] text-purple-900/40">{children}</span>;
}
