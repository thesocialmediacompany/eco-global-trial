import { notFound } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { updateCollection, deleteCollection } from "../actions";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!collection) notFound();

  const updateWithId = updateCollection.bind(null, collection.id);
  const deleteWithId = deleteCollection.bind(null, collection.id);

  return (
    <div className="mx-auto max-w-5xl">
      <CollectionForm
        action={updateWithId}
        collection={{
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          tagline: collection.tagline,
          description: collection.description,
          emoji: collection.emoji,
          gradient: collection.gradient,
          sortOrder: collection.sortOrder,
          isNew: collection.isNew,
          seoTitle: collection.seoTitle,
          seoDescription: collection.seoDescription,
          seoKeywords: collection.seoKeywords,
        }}
      />
      <div className="mt-2 flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 px-5 py-4">
        <div className="text-sm text-purple-900/70">
          <strong className="text-purple-900">Delete collection.</strong>{" "}
          {collection._count.products} product(s) will be detached (not deleted).
        </div>
        <form action={deleteWithId}>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </form>
      </div>
      <p className="mt-4 text-center">
        <Link href={`/category/${collection.slug}`} className="text-sm text-green-700 hover:underline">
          View on storefront →
        </Link>
      </p>
    </div>
  );
}
