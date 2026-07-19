import Link from "next/link";
import Image from "next/image";
import { Check, X, Trash2, Camera, ChevronUp, ChevronDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { approvePhoto, rejectPhoto, deletePhoto, movePhoto } from "./actions";

export const metadata = { title: "Customer photos" };

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

const tabs = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "pending" } = await searchParams;
  const status = tabs.some((t) => t.key === tab) ? tab : "pending";

  const [photos, pendingCount] = await Promise.all([
    prisma.communityPhoto.findMany({
      where: { status },
      // Approved photos list in the exact order the public gallery shows them,
      // so arranging here matches what visitors see.
      orderBy:
        status === "approved"
          ? [{ sortOrder: "desc" }, { moderatedAt: "desc" }]
          : [{ createdAt: "desc" }],
      take: 120,
    }),
    prisma.communityPhoto.count({ where: { status: "pending" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-1 flex items-center gap-2">
        <Camera className="h-5 w-5 text-green-600" />
        <h1 className="font-display text-2xl font-semibold text-purple-900">Customer photos</h1>
      </div>
      <p className="mb-5 text-sm text-purple-900/60">
        Photos submitted from the{" "}
        <Link href="/gallery" className="text-green-700 hover:underline" target="_blank">
          community gallery
        </Link>
        . Nothing appears publicly until you approve it.
      </p>

      <div className="mb-5 flex gap-1 border-b border-purple-100">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "pending" ? "/admin/gallery" : `/admin/gallery?tab=${t.key}`}
            className={`rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
              status === t.key
                ? "border-b-2 border-purple-600 text-purple-900"
                : "text-purple-900/50 hover:text-purple-900"
            }`}
          >
            {t.label}
            {t.key === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-purple-200 bg-white/60 py-16 text-center text-sm text-purple-900/50">
          {status === "pending" ? "No photos waiting for review. 🎉" : `No ${status} photos.`}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p, i) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
              <div className="relative aspect-square bg-cream">
                <Image src={p.imageUrl} alt={p.caption || "Submitted photo"} fill sizes="25vw" className="object-cover" />
                {status === "approved" && (
                  <>
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-purple-900/85 px-1.5 py-0.5 text-[0.6rem] font-semibold text-cream">
                      #{i + 1}
                    </span>
                    {/* Arrange: swap places with the neighbouring photo. */}
                    <div className="absolute right-1.5 top-1.5 flex flex-col gap-1">
                      <form action={movePhoto.bind(null, p.id)}>
                        <input type="hidden" name="dir" value="up" />
                        <button
                          disabled={i === 0}
                          aria-label="Move earlier"
                          title="Move earlier"
                          className="grid h-6 w-6 place-items-center rounded bg-black/55 text-white disabled:opacity-25"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <form action={movePhoto.bind(null, p.id)}>
                        <input type="hidden" name="dir" value="down" />
                        <button
                          disabled={i === photos.length - 1}
                          aria-label="Move later"
                          title="Move later"
                          className="grid h-6 w-6 place-items-center rounded bg-black/55 text-white disabled:opacity-25"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
              <div className="p-3">
                {p.caption ? (
                  <p className="line-clamp-2 text-sm text-purple-900">{p.caption}</p>
                ) : (
                  <p className="text-sm italic text-purple-900/40">No caption</p>
                )}
                <p className="mt-1 text-xs text-purple-900/50">
                  {p.name || "Anonymous"} · {formatDate(p.createdAt)}
                </p>

                <div className="mt-3 flex items-center gap-1.5">
                  {status !== "approved" && (
                    <form action={approvePhoto.bind(null, p.id)} className="flex-1">
                      <button className="flex w-full items-center justify-center gap-1 rounded-lg bg-green-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    </form>
                  )}
                  {status !== "rejected" && (
                    <form action={rejectPhoto.bind(null, p.id)}>
                      <button
                        title="Reject"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-purple-200 text-purple-900/60 hover:bg-purple-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                  <form action={deletePhoto.bind(null, p.id)}>
                    <button
                      title="Delete"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
