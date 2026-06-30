import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/store/PageBanner";
import { getPolicy, getAllPolicies } from "@/lib/content-pages";

export async function generateStaticParams() {
  const policies = await getAllPolicies();
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = await getPolicy(slug);
  if (!policy) return { title: "Policy" };
  return {
    title: policy.title,
    description: policy.intro,
    alternates: { canonical: `/policies/${slug}` },
  };
}

/** Render the lightly-formatted policy body: "## " lines = headings, blank
 * lines separate paragraphs. */
function PolicyBody({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-6">
      {blocks.map((block, i) =>
        block.startsWith("## ") ? (
          <h2 key={i} className="font-display text-2xl font-semibold text-purple-900">
            {block.slice(3).trim()}
          </h2>
        ) : (
          <p key={i} className="leading-relaxed text-purple-900/70">
            {block}
          </p>
        ),
      )}
    </div>
  );
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = await getPolicy(slug);
  if (!policy) notFound();

  const updated = new Intl.DateTimeFormat("en-PK", {
    month: "long",
    year: "numeric",
  }).format(policy.updatedAt);

  return (
    <>
      <PageBanner eyebrow="Policies" title={policy.title} description={policy.intro} />
      <section className="py-16 sm:py-24">
        <article className="mx-auto max-w-3xl px-5 lg:px-8">
          <PolicyBody body={policy.body} />
          <p className="mt-10 border-t border-purple-100 pt-6 text-sm text-purple-900/40">
            Last updated: {updated} · Eco Global Foods (SMC-PVT) Ltd.
          </p>
        </article>
      </section>
    </>
  );
}
