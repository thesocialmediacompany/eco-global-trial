import "server-only";
import { prisma } from "@/lib/prisma";

/** All gallery photos for the Our Story gallery, ordered. */
export async function getGalleryImages() {
  return prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

/** Featured gallery photos for the homepage "from our kitchen" food band. */
export async function getFeaturedGalleryImages(take = 6) {
  return prisma.galleryImage.findMany({
    where: { featured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take,
  });
}

/** Downloadable catalog / brochure PDFs for the About page. */
export async function getCatalogFiles() {
  return prisma.catalogFile.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
