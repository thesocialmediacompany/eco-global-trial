import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import {
  getStorage,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  ALLOWED_DOC_TYPES,
  MAX_DOC_BYTES,
} from "@/lib/storage";

/**
 * Admin image upload. Accepts multipart/form-data with one or more `file`
 * fields, stores them and returns their URLs. Guarded by the admin session
 * (this route is under /api so the /admin middleware doesn't cover it).
 */
export async function POST(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // `kind=pdf` accepts catalog/brochure PDFs; default accepts images only.
  const isPdf = String(form.get("kind") ?? "") === "pdf";
  const allowed = isPdf ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
  const maxBytes = isPdf ? MAX_DOC_BYTES : MAX_UPLOAD_BYTES;
  const maxLabel = isPdf ? "25 MB" : "8 MB";

  const storage = getStorage();
  const urls: string[] = [];

  for (const file of files) {
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 415 },
      );
    }
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `File too large (max ${maxLabel})` }, { status: 413 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      const { url } = await storage.save({
        buffer,
        filename: file.name,
        contentType: file.type,
      });
      urls.push(url);
    } catch (e) {
      // Surface the real storage error (S3 AccessDenied / NoSuchBucket /
      // read-only FS when S3 isn't configured) instead of a blank 500 so the
      // admin UI shows why the upload failed.
      const message = e instanceof Error ? e.message : "unknown error";
      console.error("[admin/upload] storage.save failed:", e);
      return NextResponse.json({ error: `Storage error: ${message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ urls, url: urls[0] });
}
