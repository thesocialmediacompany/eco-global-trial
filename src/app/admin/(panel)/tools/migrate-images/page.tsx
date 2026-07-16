import { requireOwner } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { ImageMigrator } from "@/components/admin/ImageMigrator";

export const metadata = { title: "Migrate images" };

export default async function MigrateImagesPage() {
  await requireOwner();
  const remaining = await prisma.product.count({
    where: {
      OR: [
        { imageUrl: { contains: "cdn.shopify.com" } },
        { images: { contains: "cdn.shopify.com" } },
      ],
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-purple-900">
        Move product images to your own storage
      </h1>
      <p className="mt-2 text-sm text-purple-900/60">
        Your product photos currently load from Shopify&rsquo;s image CDN. This tool
        copies each one into your own S3 bucket and updates the catalogue to point at
        it, so you fully own your images and no longer depend on the old Shopify store.
        It is safe to run more than once &mdash; images already moved are skipped, and
        nothing on the storefront changes visually.
      </p>
      <ImageMigrator initialRemaining={remaining} />
    </div>
  );
}
