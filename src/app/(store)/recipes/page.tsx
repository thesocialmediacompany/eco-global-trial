import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, ChefHat } from "lucide-react";
import { getRecipePosts, formatPostDate } from "@/lib/posts";
import { PageCover } from "@/components/store/PageCover";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Simple, wholesome recipes using Eco Global Foods granola, oats, malted drinks and more. Quick ideas for every meal.",
};

export default async function RecipesPage() {
  const recipes = await getRecipePosts();

  return (
    <>
      <PageCover pageKey="recipes"
        emoji="👩‍🍳"
        eyebrow="From our kitchen"
        title="Wholesome Recipes"
        description="Quick, delicious ideas to make the most of your Eco Global Foods pantry."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {recipes.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-purple-200 bg-white/50 py-20 text-center">
              <ChefHat className="h-10 w-10 text-purple-300" />
              <p className="mt-3 text-purple-900/60">Fresh recipes are coming soon.</p>
            </div>
          ) : (
            <RevealGroup
              stagger={0.08}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {recipes.map((post) => (
                <RevealItem key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm transition hover:shadow-xl hover:shadow-purple-900/10"
                  >
                    <div className={`grid aspect-[16/10] place-items-center text-6xl ${post.gradient}`}>
                      {post.coverEmoji}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-green-800">
                        <ChefHat className="h-3 w-3" /> Recipe
                      </span>
                      <h3 className="mt-3 font-display text-xl font-semibold leading-tight text-purple-900 group-hover:text-purple-700">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-purple-900/60">{post.excerpt}</p>
                      <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-purple-900/45">
                        <span>{formatPostDate(post.publishedAt)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {post.readMinutes} min
                        </span>
                        <ArrowRight className="ml-auto h-4 w-4 text-green-700 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>
    </>
  );
}
