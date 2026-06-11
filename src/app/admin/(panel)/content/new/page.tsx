import { PostForm } from "@/components/admin/PostForm";
import { createPost } from "../actions";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return <PostForm action={createPost} defaultType={type === "recipe" ? "recipe" : "blog"} />;
}
