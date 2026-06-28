import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "../../products/actions";

export default async function NewHorecaProductPage() {
  const collections = await prisma.collection.findMany({ orderBy: { sortOrder: "asc" } });
  const horeca = collections.find((c) => c.slug === "horeca");

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/horeca"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to HORECA
      </Link>
      <div className="mb-4 rounded-xl border border-green-100 bg-green-50/60 px-4 py-3 text-sm text-green-800">
        This product will be added to the <strong>HORECA</strong> category automatically.
        You can still change the collection below if needed.
      </div>
      <ProductForm
        action={createProduct}
        collections={collections.map((c) => ({ id: c.id, name: c.name }))}
        defaultCollectionId={horeca?.id}
      />
    </div>
  );
}
