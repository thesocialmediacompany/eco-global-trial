import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getJournalPosts, formatPostDate } from "@/lib/posts";
import { PageCover } from "@/components/store/PageCover";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Recipes, wellness tips and stories from Eco Global Foods. Wholesome ideas for modern living.",
};

export default async function BlogPage() {
  const posts = await getJournalPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <PageCover pageKey="blog"
        emoji="📖"
        eyebrow="The Goodness Journal"
        title="Stories, recipes & wellness"
        description="Wholesome ideas, simple recipes and the thinking behind our natural range."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {/* featured */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group mb-12 grid overflow-hidden rounded-[2rem] border border-purple-100 bg-white shadow-sm lg:grid-cols-2"
            >
              <div
                className={`grid aspect-[16/10] place-items-center text-[7rem] ${featured.gradient}`}
              >
                {featured.coverEmoji}
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">
                  {featured.category}
                </span>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-purple-900">
                  {featured.title}
                </h2>
                <p className="mt-3 text-purple-900/60">{featured.excerpt}</p>
                <div className="mt-5 flex items-center gap-4 text-sm text-purple-900/50">
                  <span>{formatPostDate(featured.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {featured.readMinutes} min read
                  </span>
                </div>
                <span className="mt-6 inline-flex items-center gap-1 font-semibold text-purple-700 transition-all group-hover:gap-2">
                  Read article <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          )}

          {/* grid */}
          <RevealGroup
            stagger={0.08}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {rest.map((post) => (
              <RevealItem key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm transition hover:shadow-xl hover:shadow-purple-900/10"
                >
                  <div
                    className={`grid aspect-[16/10] place-items-center text-6xl ${post.gradient}`}
                  >
                    {post.coverEmoji}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">
                      {post.category}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-purple-900 group-hover:text-purple-700">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-purple-900/60">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-purple-900/45">
                      <span>{formatPostDate(post.publishedAt)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readMinutes} min
                      </span>
                    </div>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
