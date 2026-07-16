import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import {
  createUploadUrl,
  s3Configured,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOC_TYPES,
} from "@/lib/storage";

/**
 * Returns a short-lived presigned S3 URL the browser uses to upload a file
 * DIRECTLY to S3. This keeps the (large) file bytes off the app server, which
 * on Amplify would otherwise be blocked by the WAF body-size rule (~8 KB) or
 * the Lambda payload limit. Guarded by the admin session.
 *
 * When S3 isn't configured (local dev), responds { fallback: true } so the
 * client falls back to the multipart /api/admin/upload route (local disk).
 */
export async function POST(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!s3Configured()) {
    return NextResponse.json({ fallback: true });
  }

  let body: { filename?: string; contentType?: string; kind?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const filename = String(body.filename ?? "").trim() || "file";
  const contentType = String(body.contentType ?? "");
  const allowed = body.kind === "pdf" ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
  if (!allowed.includes(contentType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${contentType || "unknown"}` },
      { status: 415 },
    );
  }

  try {
    const { uploadUrl, publicUrl } = await createUploadUrl({ filename, contentType });
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.error("[admin/upload-url] presign failed:", e);
    return NextResponse.json({ error: `Storage error: ${message}` }, { status: 500 });
  }
}
