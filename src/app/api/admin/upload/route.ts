import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import {
  getStorage,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
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

  const storage = getStorage();
  const urls: string[] = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 415 },
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 413 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await storage.save({
      buffer,
      filename: file.name,
      contentType: file.type,
    });
    urls.push(url);
  }

  return NextResponse.json({ urls, url: urls[0] });
}
