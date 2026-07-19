import { formatDate } from "@/lib/dates";
import Link from "next/link";
import { Star, Check, Undo2, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { approveReview, unapproveReview, deleteReview } from "./actions";


export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { product: { select: { title: true, slug: true } } },
  });
  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-purple-900">Reviews</h1>
        <p className="mt-1 text-sm text-purple-900/60">
          {reviews.length} total · {pending} pending approval
        </p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 && (
          <div className="rounded-xl border border-dashed border-purple-200 bg-white/60 py-12 text-center text-purple-900/50">
            No reviews yet.
          </div>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-purple-900">{r.customerName}</span>
                  <StatusBadge status={r.status === "approved" ? "active" : "pending"} />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.rating ? "fill-gold-400 text-gold-400" : "text-purple-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-purple-900/50">
                    on{" "}
                    <Link href={`/product/${r.product.slug}`} className="text-green-700 hover:underline">
                      {r.product.title}
                    </Link>{" "}
                    · {formatDate(r.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {r.status === "pending" ? (
                  <form action={approveReview.bind(null, r.id)}>
                    <button className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-800 hover:bg-green-200">
                      <Check className="h-4 w-4" /> Approve
                    </button>
                  </form>
                ) : (
                  <form action={unapproveReview.bind(null, r.id)}>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-purple-200 px-3 py-1.5 text-sm font-medium text-purple-900 hover:bg-purple-50">
                      <Undo2 className="h-4 w-4" /> Unpublish
                    </button>
                  </form>
                )}
                <form action={deleteReview.bind(null, r.id)}>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
            {r.title && <p className="mt-3 font-semibold text-purple-900">{r.title}</p>}
            <p className="mt-1 text-sm text-purple-900/70">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
