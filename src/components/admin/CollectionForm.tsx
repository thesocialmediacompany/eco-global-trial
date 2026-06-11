"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

type CollectionData = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  emoji: string;
  gradient: string;
  sortOrder: number;
  isNew: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

const gradientOptions = [
  { value: "gradient-purple", label: "Purple" },
  { value: "gradient-green", label: "Green" },
  { value: "gradient-purple-green", label: "Purple → Green" },
];

export function CollectionForm({
  action,
  collection,
}: {
  action: (formData: FormData) => Promise<void>;
  collection?: CollectionData;
}) {
  const router = useRouter();
  const [emoji, setEmoji] = useState(collection?.emoji ?? "🌿");
  const [gradient, setGradient] = useState(collection?.gradient ?? "gradient-purple");

  return (
    <form action={action} className="mx-auto max-w-5xl pb-24">
      <input type="hidden" name="emoji" value={emoji} />
      <input type="hidden" name="gradient" value={gradient} />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/collections")}
            className="grid h-9 w-9 place-items-center rounded-lg border border-purple-100 bg-white text-purple-900/70 hover:bg-purple-50"
            aria-label="Back"
          >
            <X className="h-4 w-4" />
          </button>
          <h1 className="font-display text-xl font-semibold text-purple-900">
            {collection ? collection.name : "New collection"}
          </h1>
        </div>
        <Submit />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <Field label="Name">
              <input name="name" required defaultValue={collection?.name} className={input} />
            </Field>
            <Field label="URL slug (optional - auto from name)">
              <input name="slug" defaultValue={collection?.slug} placeholder="e.g. granola-cereals" className={input} />
            </Field>
            <Field label="Tagline">
              <input name="tagline" defaultValue={collection?.tagline} className={input} />
            </Field>
            <Field label="Description">
              <textarea name="description" rows={3} defaultValue={collection?.description} className={input} />
            </Field>
          </Card>

          <Card title="Search engine listing">
            <Field label="Page title">
              <input name="seoTitle" defaultValue={collection?.seoTitle} maxLength={70} className={input} />
            </Field>
            <Field label="Meta description">
              <textarea name="seoDescription" rows={3} defaultValue={collection?.seoDescription} maxLength={160} className={input} />
            </Field>
            <Field label="Keywords (comma-separated)">
              <input name="seoKeywords" defaultValue={collection?.seoKeywords} className={input} />
            </Field>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Display">
            <Field label="Sort order">
              <input name="sortOrder" type="number" defaultValue={collection?.sortOrder ?? 0} className={input} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-purple-900/80">
              <input type="checkbox" name="isNew" defaultChecked={collection?.isNew} className="h-4 w-4 accent-green-600" />
              Mark as new
            </label>
          </Card>

          <Card title="Appearance">
            <Field label="Emoji">
              <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} className={`${input} text-center text-2xl`} />
            </Field>
            <Field label="Gradient">
              <select value={gradient} onChange={(e) => setGradient(e.target.value)} className={input}>
                {gradientOptions.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </Field>
            <div className={`mt-2 grid h-24 place-items-center rounded-lg text-4xl ${gradient}`}>{emoji}</div>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg gradient-purple-green px-5 py-2 text-sm font-semibold text-cream disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-4 font-display text-base font-semibold text-purple-900">{title}</h2>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-purple-900/70">{label}</span>
      {children}
    </label>
  );
}
