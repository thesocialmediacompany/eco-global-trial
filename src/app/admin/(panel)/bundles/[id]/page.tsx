import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BundleForm } from "@/components/admin/BundleForm";
import { updateBundle, deleteBundle } from "../actions";

export default async function EditBundlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bundle, products] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { bundleItems: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.findMany({
      where: { isBundle: false, status: "active" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, price: true, emoji: true, gradient: true, imageUrl: true },
    }),
  ]);
  if (!bundle || !bundle.isBundle) notFound();

  const updateWithId = updateBundle.bind(null, bundle.id);
  const deleteWithId = deleteBundle.bind(null, bundle.id);

  return (
    <div className="mx-auto max-w-5xl">
      <BundleForm
        action={updateWithId}
        products={products}
        bundle={{
          id: bundle.id,
          title: bundle.title,
          tagline: bundle.tagline,
          description: bundle.description,
          price: bundle.price,
          status: bundle.status,
          imageUrl: bundle.imageUrl,
          emoji: bundle.emoji,
          items: bundle.bundleItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }}
      />

      <div className="mt-2 flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 px-5 py-4">
        <p className="text-sm text-purple-900/70">
          <strong className="text-purple-900">Delete bundle.</strong> Member products are
          not affected.
        </p>
        <form action={deleteWithId}>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </form>
      </div>
      <p className="mt-4 text-center">
        <Link href={`/product/${bundle.slug}`} className="text-sm text-green-700 hover:underline">
          View on storefront →
        </Link>
      </p>
    </div>
  );
}
