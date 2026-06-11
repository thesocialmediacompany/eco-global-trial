import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/PostForm";
import { updatePost } from "../actions";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  const updateWithId = updatePost.bind(null, post.id);

  return (
    <PostForm
      action={updateWithId}
      post={{
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        coverEmoji: post.coverEmoji,
        gradient: post.gradient,
        author: post.author,
        type: post.type,
        category: post.category,
        status: post.status,
        readMinutes: post.readMinutes,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        seoKeywords: post.seoKeywords,
      }}
    />
  );
}
