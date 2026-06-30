import { HelpCircle, FileText, Trash2, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { addFaq, updateFaq, deleteFaq, updatePolicy } from "./actions";

export default async function PagesAdmin() {
  await requireOwner();
  const [faqs, policies] = await Promise.all([
    prisma.faqItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.policy.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div>
        <h1 className="font-display text-2xl font-semibold text-purple-900">FAQ &amp; pages</h1>
        <p className="mt-1 text-sm text-purple-900/60">
          Edit the questions on <strong>/faq</strong> and the policy pages
          (privacy, terms, shipping, refund). No code needed.
        </p>
      </div>

      {/* FAQ */}
      <section className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-purple-900">
          <HelpCircle className="h-5 w-5 text-green-600" /> FAQ
          <span className="ml-1 text-sm font-normal text-purple-900/50">({faqs.length})</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((f) => (
            <form key={f.id} action={updateFaq.bind(null, f.id)} className="rounded-lg border border-purple-100 bg-cream/30 p-3">
              <input name="question" defaultValue={f.question} className={`${input} mb-2 font-medium`} />
              <textarea name="answer" defaultValue={f.answer} rows={2} className={input} />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-purple-900">
                  <input type="checkbox" name="active" defaultChecked={f.active} className="h-4 w-4 accent-green-600" /> Show
                </label>
                <label className="flex items-center gap-1.5 text-xs text-purple-900/70">
                  Order <input name="sortOrder" type="number" defaultValue={f.sortOrder} className={`${input} w-16`} />
                </label>
                <button className="ml-auto rounded-lg gradient-purple-green px-3.5 py-1.5 text-xs font-semibold text-cream">Save</button>
                <button formAction={deleteFaq.bind(null, f.id)} className="grid h-8 w-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </form>
          ))}
        </div>

        <form action={addFaq} className="mt-3 rounded-lg border border-dashed border-purple-200 p-3">
          <input name="question" required placeholder="New question" className={`${input} mb-2`} />
          <textarea name="answer" required placeholder="Answer" rows={2} className={input} />
          <button className="mt-2 inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-3.5 py-1.5 text-xs font-semibold text-cream">
            <Plus className="h-4 w-4" /> Add question
          </button>
        </form>
      </section>

      {/* Policies */}
      <section className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-purple-900">
          <FileText className="h-5 w-5 text-green-600" /> Policy pages
        </h2>
        <p className="mb-4 text-xs text-purple-900/50">
          In the body, a line starting with <code>## </code> becomes a heading; blank lines
          separate paragraphs.
        </p>

        <div className="space-y-4">
          {policies.map((p) => (
            <form key={p.slug} action={updatePolicy.bind(null, p.slug)} className="rounded-lg border border-purple-100 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-900/40">/policies/{p.slug}</p>
              <label className="mb-2 block">
                <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Title</span>
                <input name="title" defaultValue={p.title} className={input} />
              </label>
              <label className="mb-2 block">
                <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Intro</span>
                <input name="intro" defaultValue={p.intro} className={input} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Body</span>
                <textarea name="body" defaultValue={p.body} rows={10} className={`${input} font-mono text-xs`} />
              </label>
              <button className="mt-3 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">
                Save {p.title}
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";
