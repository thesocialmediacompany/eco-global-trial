"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

type PostData = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  coverEmoji: string;
  gradient: string;
  author: string;
  type: string;
  category: string;
  status: string;
  readMinutes: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

const gradientOptions = [
  { value: "gradient-purple", label: "Purple" },
  { value: "gradient-green", label: "Green" },
  { value: "gradient-purple-green", label: "Purple → Green" },
];

export function PostForm({
  action,
  post,
  defaultType = "blog",
}: {
  action: (formData: FormData) => Promise<void>;
  post?: PostData;
  defaultType?: string;
}) {
  const router = useRouter();
  const [emoji, setEmoji] = useState(post?.coverEmoji ?? "🌿");
  const [gradient, setGradient] = useState(post?.gradient ?? "gradient-purple");

  return (
    <form action={action} className="mx-auto max-w-5xl pb-24">
      <input type="hidden" name="coverEmoji" value={emoji} />
      <input type="hidden" name="gradient" value={gradient} />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/content")}
            className="grid h-9 w-9 place-items-center rounded-lg border border-purple-100 bg-white text-purple-900/70 hover:bg-purple-50"
            aria-label="Back"
          >
            <X className="h-4 w-4" />
          </button>
          <h1 className="font-display text-xl font-semibold text-purple-900">
            {post ? post.title : "New post"}
          </h1>
        </div>
        <SubmitButton />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <Field label="Title">
              <input name="title" required defaultValue={post?.title} className={input} />
            </Field>
            <Field label="Excerpt">
              <textarea name="excerpt" rows={2} defaultValue={post?.excerpt} className={input} />
            </Field>
            <Field label="Body (separate paragraphs with a blank line)">
              <textarea name="body" rows={14} defaultValue={post?.body} className={input} />
            </Field>
          </Card>

          <Card title="Search engine listing">
            <Field label="Page title">
              <input name="seoTitle" defaultValue={post?.seoTitle} maxLength={70} className={input} />
            </Field>
            <Field label="Meta description">
              <textarea
                name="seoDescription"
                rows={3}
                defaultValue={post?.seoDescription}
                maxLength={160}
                className={input}
              />
            </Field>
            <Field label="Keywords (comma-separated)">
              <input name="seoKeywords" defaultValue={post?.seoKeywords} className={input} />
            </Field>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Type">
            <select name="type" defaultValue={post?.type ?? defaultType} className={input}>
              <option value="blog">📝 Blog post</option>
              <option value="recipe">🍳 Recipe</option>
            </select>
            <p className="-mt-1 text-xs text-purple-900/45">
              Blogs appear under <strong>/blog</strong>, recipes under <strong>/recipes</strong>.
            </p>
          </Card>

          <Card title="Status">
            <select name="status" defaultValue={post?.status ?? "published"} className={input}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </Card>

          <Card title="Details">
            <Field label="Category">
              <input name="category" defaultValue={post?.category ?? "Wellness"} className={input} />
            </Field>
            <Field label="Author">
              <input name="author" defaultValue={post?.author ?? "Eco Global Foods"} className={input} />
            </Field>
            <Field label="Read time (minutes)">
              <input
                name="readMinutes"
                type="number"
                min={1}
                defaultValue={post?.readMinutes ?? 4}
                className={input}
              />
            </Field>
          </Card>

          <Card title="Cover">
            <Field label="Emoji">
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className={`${input} text-center text-2xl`}
              />
            </Field>
            <Field label="Gradient">
              <select
                value={gradient}
                onChange={(e) => setGradient(e.target.value)}
                className={input}
              >
                {gradientOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className={`mt-2 grid h-28 place-items-center rounded-lg text-5xl ${gradient}`}>
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

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
      {title && (
        <h2 className="mb-4 font-display text-base font-semibold text-purple-900">{title}</h2>
      )}
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
