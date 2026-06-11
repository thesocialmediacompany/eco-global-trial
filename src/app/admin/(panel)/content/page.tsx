import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPostDate } from "@/lib/posts";

const tabs = [
  { key: "all", label: "All" },
  { key: "blog", label: "Blog posts" },
  { key: "recipe", label: "Recipes" },
];

function whereFor(tab: string): Prisma.PostWhereInput {
  if (tab === "blog") return { type: "blog" };
  if (tab === "recipe") return { type: "recipe" };
  return {};
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "all" } = await searchParams;

  const [posts, blogCount, recipeCount] = await Promise.all([
    prisma.post.findMany({ where: whereFor(tab), orderBy: { publishedAt: "desc" } }),
    prisma.post.count({ where: { type: "blog" } }),
    prisma.post.count({ where: { type: "recipe" } }),
  ]);

  const addType = tab === "recipe" ? "recipe" : "blog";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-purple-900">Content</h1>
          <p className="mt-1 text-sm text-purple-900/60">
            {blogCount} blog post{blogCount === 1 ? "" : "s"} · {recipeCount} recipe
            {recipeCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/content/new?type=blog"
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50"
          >
            <Plus className="h-4 w-4" /> Blog post
          </Link>
          <Link
            href="/admin/content/new?type=recipe"
            className="inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-3.5 py-2 text-sm font-semibold text-cream hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> Recipe
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        {/* tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-purple-100 px-4 py-3">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin/content?tab=${t.key}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t.key
                  ? "bg-purple-100 text-purple-900"
                  : "text-purple-900/60 hover:bg-purple-50"
              }`}
            >
              {t.label}
              {t.key === "blog" && <span className="ml-1.5 text-purple-900/40">{blogCount}</span>}
              {t.key === "recipe" && <span className="ml-1.5 text-purple-900/40">{recipeCount}</span>}
            </Link>
          ))}
          <Link
            href={`/admin/content/new?type=${addType}`}
            className="ml-auto hidden text-sm font-medium text-green-700 hover:text-green-800 sm:inline"
          >
            + Add {addType === "recipe" ? "recipe" : "blog post"}
          </Link>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Published</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-purple-900/50">
                  No {tab === "recipe" ? "recipes" : tab === "blog" ? "blog posts" : "content"} yet.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="border-b border-purple-50 last:border-0 hover:bg-cream/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/content/${p.id}`} className="flex items-center gap-3">
                      <span className={`grid h-10 w-10 place-items-center rounded-lg text-xl ${p.gradient}`}>
                        {p.coverEmoji}
                      </span>
                      <span className="font-medium text-purple-900 hover:text-purple-700">{p.title}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.type === "recipe"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {p.type === "recipe" ? "🍳 Recipe" : "📝 Blog"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-purple-900/70">{p.category}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status === "published" ? "active" : "draft"} />
                  </td>
                  <td className="px-5 py-3 text-purple-900/70">{formatPostDate(p.publishedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
