import { type NextRequest, NextResponse } from "next/server";
import { createCommunityUploadPost } from "@/lib/storage";

/**
 * Public: hand a visitor a presigned POST so their photo goes straight to S3.
 * S3 enforces the image content-type and size cap via the POST policy, so the
 * bytes never touch our server and a bad file is rejected at the edge.
 */
export async function POST(req: NextRequest) {
  let contentType = "";
  try {
    contentType = String((await req.json()).contentType ?? "");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Only images can be uploaded." }, { status: 400 });
  }

  const post = await createCommunityUploadPost(contentType);
  if (!post) {
    return NextResponse.json({ error: "Uploads aren't available right now." }, { status: 503 });
  }

  return NextResponse.json(post);
}
