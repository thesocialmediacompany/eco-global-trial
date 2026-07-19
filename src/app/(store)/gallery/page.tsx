import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GallerySubmit } from "@/components/site/GallerySubmit";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Community Gallery | Eco Global Foods",
  description:
    "Real photos from the Eco Global Foods community — our natural products at home, in the kitchen and in stores across Pakistan. Share yours!",
};

interface Photo {
  id: string;
  imageUrl: string;
  caption: string;
  name: string;
  productSlug: string;
}

export default async function GalleryPage() {
  let photos: Photo[] = [];
  try {
    photos = await prisma.communityPhoto.findMany({
      where: { status: "approved" },
      // Staff-arranged order first (highest = leading); date breaks ties.
      orderBy: [{ sortOrder: "desc" }, { moderatedAt: "desc" }],
      take: 90,
      select: { id: true, imageUrl: true, caption: true, name: true, productSlug: true },
    });
  } catch {
    photos = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
          <Camera className="h-3.5 w-3.5" /> Community Gallery
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-purple-900 sm:text-4xl">
          Real food, real kitchens
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-purple-900/60">
          Photos from our community across Pakistan — Eco Global Foods at home, in the kitchen and
          on the shelves. Snap yours and share it with us.
        </p>
        <div className="mt-6 flex justify-center">
          <GallerySubmit />
        </div>
      </div>

      {/* Grid */}
      {photos.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-purple-200 bg-white/60 py-20 text-center">
          <p className="font-display text-lg font-semibold text-purple-900">No photos yet</p>
          <p className="mt-1 text-sm text-purple-900/60">
            Be the first to share how you enjoy Eco Global Foods.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => {
            const tile = (
              <div className="group relative aspect-square overflow-hidden rounded-xl border border-purple-100 bg-cream">
                <Image
                  src={p.imageUrl}
                  alt={p.caption || "Community photo"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {(p.caption || p.name) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    {p.caption && (
                      <p className="line-clamp-2 text-xs text-white/95">{p.caption}</p>
                    )}
                    {p.name && <p className="mt-0.5 text-[0.65rem] text-white/70">— {p.name}</p>}
                  </div>
                )}
              </div>
            );
            return p.productSlug ? (
              <Link key={p.id} href={`/product/${p.productSlug}`} title="View product">
                {tile}
              </Link>
            ) : (
              <div key={p.id}>{tile}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
