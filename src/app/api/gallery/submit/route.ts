import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isOwnCommunityUrl } from "@/lib/storage";

/**
 * Public: record a submitted photo as PENDING. It only appears on the gallery
 * once an admin approves it. Guards: the image must already live in our own
 * community/ S3 prefix (so this can't be used to post arbitrary URLs), a
 * honeypot field traps bots, and text is length-capped.
 */
export async function POST(req: NextRequest) {
  let body: {
    imageUrl?: string;
    caption?: string;
    name?: string;
    productSlug?: string;
    website?: string; // honeypot — real users never see or fill this
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Bot fell for the honeypot: pretend success, store nothing.
  if (body.website) return NextResponse.json({ ok: true });

  const imageUrl = String(body.imageUrl ?? "");
  if (!isOwnCommunityUrl(imageUrl)) {
    return NextResponse.json({ error: "Please upload a photo first." }, { status: 400 });
  }

  const caption = String(body.caption ?? "").trim().slice(0, 280);
  const name = String(body.name ?? "").trim().slice(0, 60);
  const productSlug = String(body.productSlug ?? "").trim().slice(0, 120);

  await prisma.communityPhoto.create({
    data: { imageUrl, caption, name, productSlug, status: "pending" },
  });

  return NextResponse.json({ ok: true });
}
