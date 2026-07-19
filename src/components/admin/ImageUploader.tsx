"use client";

import { useRef, useState } from "react";
import { Upload, X, Plus, Loader2, Star, ImageIcon } from "lucide-react";
import { MAX_UPLOAD_BYTES, tooLargeMessage } from "@/lib/upload-limits";

interface Props {
  defaultImageUrl?: string;
  defaultImages?: string; // comma-separated
}

/**
 * Product media manager, arranged the way Shopify does it: one grid of all
 * photos where the FIRST is the main image. Drag a tile to reorder (desktop),
 * or tap "Make main" on any tile (works on phones, where dragging is awkward).
 * Serialises to the form's `imageUrl` (first) + `images` (the rest).
 */
export function ImageUploader({ defaultImageUrl = "", defaultImages = "" }: Props) {
  const [media, setMedia] = useState<string[]>(() => {
    const rest = defaultImages ? defaultImages.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const all = defaultImageUrl ? [defaultImageUrl, ...rest] : rest;
    // de-dupe while preserving order (primary sometimes also appears in images)
    return [...new Set(all)];
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File): Promise<string> {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error(tooLargeMessage(file.name, file.size));
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
      const put = await fetch(info.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error(`S3 upload failed (${put.status})`);
      return info.publicUrl as string;
    }
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Upload failed");
    }
    return (await res.json()).url as string;
  }

  async function onAdd(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadOne(file));
      setMedia((m) => [...new Set([...m, ...urls])]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function remove(i: number) {
    setMedia((m) => m.filter((_, idx) => idx !== i));
  }

  function makeMain(i: number) {
    setMedia((m) => {
      const next = [...m];
      const [picked] = next.splice(i, 1);
      next.unshift(picked);
      return next;
    });
  }

  /** Move the dragged tile to where it was dropped. */
  function onDrop(target: number) {
    setMedia((m) => {
      if (dragIndex === null || dragIndex === target) return m;
      const next = [...m];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(target, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  const primary = media[0] ?? "";

  return (
    <div className="space-y-3">
      {/* serialised for the product form: first = primary, rest = gallery */}
      <input type="hidden" name="imageUrl" value={primary} />
      <input type="hidden" name="images" value={media.slice(1).join(",")} />

      <div className="flex flex-wrap gap-3">
        {media.map((url, i) => (
          <div
            key={url}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            onDragEnd={() => setDragIndex(null)}
            className={`group relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border bg-white ${
              i === 0 ? "border-purple-400 ring-2 ring-purple-200" : "border-purple-100"
            } ${dragIndex === i ? "opacity-40" : ""}`}
            title={i === 0 ? "Main image — drag to reorder" : "Drag to reorder"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Product image ${i + 1}`} className="h-full w-full cursor-move object-cover" />

            {i === 0 && (
              <span className="absolute left-1 top-1 rounded-md bg-purple-900/85 px-1.5 py-0.5 text-[0.6rem] font-semibold text-cream">
                Main
              </span>
            )}

            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove image"
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>

            {i !== 0 && (
              <button
                type="button"
                onClick={() => makeMain(i)}
                className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-1 text-[0.65rem] font-semibold text-white opacity-0 transition group-hover:opacity-100"
              >
                <Star className="h-3 w-3" /> Make main
              </button>
            )}
          </div>
        ))}

        {/* add */}
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="grid h-28 w-28 shrink-0 place-items-center rounded-xl border-2 border-dashed border-purple-200 text-purple-900/40 transition hover:border-purple-400"
        >
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-xs">
              {media.length === 0 ? <Upload className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {media.length === 0 ? "Upload" : "Add"}
            </span>
          )}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => onAdd(e.target.files)}
        />
      </div>

      <p className="text-xs text-purple-900/45">
        The first photo is the main image shoppers see. Drag to reorder, or tap{" "}
        <span className="font-medium">Make main</span> on any photo.
      </p>

      {/* paste URL fallback */}
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-purple-900/30" />
        <input
          type="url"
          placeholder="…or paste an image URL to add"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = (e.target as HTMLInputElement).value.trim();
              if (v) {
                setMedia((m) => [...new Set([...m, v])]);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
          className="flex-1 rounded-lg border border-purple-100 bg-white px-3 py-1.5 text-xs text-purple-900 outline-none focus:border-purple-300"
        />
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
