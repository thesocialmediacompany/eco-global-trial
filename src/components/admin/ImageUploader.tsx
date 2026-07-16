"use client";

import { useRef, useState } from "react";
import { Upload, X, Plus, Loader2, ImageIcon } from "lucide-react";

interface Props {
  defaultImageUrl?: string;
  defaultImages?: string; // comma-separated
}

/**
 * Product image manager: uploads files to /api/admin/upload (or accepts pasted
 * URLs) and serialises the result into hidden `imageUrl` + `images` fields the
 * product form submits.
 */
export function ImageUploader({ defaultImageUrl = "", defaultImages = "" }: Props) {
  const [primary, setPrimary] = useState(defaultImageUrl);
  const [gallery, setGallery] = useState<string[]>(
    defaultImages ? defaultImages.split(",").map((s) => s.trim()).filter(Boolean) : [],
  );
  const [busy, setBusy] = useState<"primary" | "gallery" | null>(null);
  const [error, setError] = useState("");

  const primaryInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File): Promise<string> {
    // 1. Ask the app for a presigned URL (a tiny JSON request that slips under
    //    the WAF/body-size limit). In production this returns a direct-to-S3
    //    URL; in local dev it returns { fallback: true }.
    const pres = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    if (!pres.ok) {
      const err = await pres.json().catch(() => ({}));
      throw new Error(err.error || "Upload failed");
    }
    const info = await pres.json();
    if (info.uploadUrl) {
      // 2. PUT the file straight to S3 - the bytes never touch the app server,
      //    so the WAF/Lambda body limits don't apply.
      const put = await fetch(info.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error(`S3 upload failed (${put.status})`);
      return info.publicUrl as string;
    }
    // Fallback (local dev / no S3): multipart to the app server.
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Upload failed");
    }
    return (await res.json()).url as string;
  }

  async function upload(files: FileList): Promise<string[]> {
    const out: string[] = [];
    for (const file of Array.from(files)) out.push(await uploadOne(file));
    return out;
  }

  async function onPrimary(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setBusy("primary");
    try {
      const [url] = await upload(files);
      setPrimary(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function onGallery(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setBusy("gallery");
    try {
      const urls = await upload(files);
      setGallery((g) => [...g, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* serialised values */}
      <input type="hidden" name="imageUrl" value={primary} />
      <input type="hidden" name="images" value={gallery.join(",")} />

      <div className="flex gap-4">
        {/* primary */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-purple-900/70">Primary image</p>
          <button
            type="button"
            onClick={() => primaryInput.current?.click()}
            className="relative grid h-32 w-32 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-purple-200 bg-cream/40 text-purple-900/40 transition hover:border-purple-400"
          >
            {busy === "primary" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : primary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={primary} alt="primary" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs">
                <Upload className="h-5 w-5" /> Upload
              </span>
            )}
          </button>
          {primary && (
            <button
              type="button"
              onClick={() => setPrimary("")}
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-rose-600 hover:underline"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          )}
          <input
            ref={primaryInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onPrimary(e.target.files)}
          />
        </div>

        {/* gallery */}
        <div className="flex-1">
          <p className="mb-1.5 text-xs font-medium text-purple-900/70">Gallery</p>
          <div className="flex flex-wrap gap-2">
            {gallery.map((url, i) => (
              <div
                key={url + i}
                className="group relative h-20 w-20 overflow-hidden rounded-lg border border-purple-100 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`gallery ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setGallery((g) => g.filter((_, idx) => idx !== i))}
                  className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => galleryInput.current?.click()}
              className="grid h-20 w-20 place-items-center rounded-lg border-2 border-dashed border-purple-200 text-purple-900/40 transition hover:border-purple-400"
            >
              {busy === "gallery" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </button>
          </div>
          <input
            ref={galleryInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => onGallery(e.target.files)}
          />
        </div>
      </div>

      {/* paste URL fallback */}
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-purple-900/30" />
        <input
          type="url"
          placeholder="…or paste a primary image URL"
          defaultValue=""
          onChange={(e) => e.target.value && setPrimary(e.target.value.trim())}
          className="flex-1 rounded-lg border border-purple-100 bg-white px-3 py-1.5 text-xs text-purple-900 outline-none focus:border-purple-300"
        />
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
