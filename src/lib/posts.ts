import "server-only";
import { prisma } from "@/lib/prisma";

export async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });
}

/** Recipe-type posts (for the /recipes hub). */
export async function getRecipePosts() {
  return prisma.post.findMany({
    where: { status: "published", type: "recipe" },
    orderBy: { publishedAt: "desc" },
  });
}

/** Blog-type posts (for the main /blog list). */
export async function getJournalPosts() {
  return prisma.post.findMany({
    where: { status: "published", type: "blog" },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function getRelatedPosts(excludeSlug: string, take = 3) {
  return prisma.post.findMany({
    where: { status: "published", slug: { not: excludeSlug } },
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export function formatPostDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
