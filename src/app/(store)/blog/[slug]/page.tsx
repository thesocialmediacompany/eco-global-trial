import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, ArrowRight } from "lucide-react";
import { getPostBySlug, getRelatedPosts, formatPostDate } from "@/lib/posts";

// ISR — see product/[slug]/page.tsx.
export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords ? post.seoKeywords.split(",") : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") notFound();

  const related = await getRelatedPosts(post.slug);
  const paragraphs = post.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt.toISOString(),
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Eco Global Foods" },
  };

  return (
    <article className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* hero */}
      <header
        className={`relative isolate overflow-hidden ${post.gradient} px-5 pb-16 pt-28 text-cream sm:pt-32 lg:px-8`}
      >
        <div className="relative mx-auto max-w-3xl text-center">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1 text-sm text-cream/70 transition hover:text-cream"
          >
            <ChevronLeft className="h-4 w-4" /> All articles
          </Link>
          <div className="text-6xl">{post.coverEmoji}</div>
          <span className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-gold-300">
            {post.category}
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-5 flex items-center justify-center gap-4 text-sm text-cream/70">
            <span>{post.author}</span>
            <span>·</span>
            <span>{formatPostDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readMinutes} min read
            </span>
          </div>
        </div>
      </header>

      {/* body */}
      <div className="mx-auto max-w-2xl px-5 py-12 lg:px-0">
        <p className="mb-8 text-lg font-medium leading-relaxed text-purple-900/80">
          {post.excerpt}
        </p>
        <div className="space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed text-purple-900/75">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-semibold text-purple-900">
            Keep reading
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group rounded-2xl border border-purple-100 bg-white p-5 transition hover:shadow-sm"
              >
                <div className="text-3xl">{p.coverEmoji}</div>
                <h3 className="mt-3 font-display text-base font-semibold leading-tight text-purple-900 group-hover:text-purple-700">
                  {p.title}
                </h3>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-green-700">
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
