"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

/**
 * Manages up to `max` cover images and serialises them into a hidden CSV field
 * the surrounding server-action form submits. Uploads to /api/admin/upload.
 */
export function MultiImageField({
  name,
  defaultImages = "",
  max = 5,
}: {
  name: string;
  defaultImages?: string;
  max?: number;
}) {
  const [imgs, setImgs] = useState<string[]>(
    defaultImages ? defaultImages.split(",").map((s) => s.trim()).filter(Boolean).slice(0, max) : [],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    const room = max - imgs.length;
    if (room <= 0) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      Array.from(files).slice(0, room).forEach((f) => fd.append("file", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Upload failed");
      }
      const d = await res.json();
      setImgs((v) => [...v, ...((d.urls as string[]) || [])].slice(0, max));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={imgs.join(",")} />
      <div className="flex flex-wrap gap-2">
        {imgs.map((u, i) => (
          <div key={u + i} className="group relative h-20 w-28 overflow-hidden rounded-lg border border-purple-100 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt={`cover ${i + 1}`} className="h-full w-full object-cover" />
            <span className="absolute left-1 top-1 rounded bg-black/50 px-1 text-[0.6rem] font-bold text-white">
              {i + 1}
            </span>
            <button
              type="button"
              onClick={() => setImgs((v) => v.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {imgs.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid h-20 w-28 place-items-center rounded-lg border-2 border-dashed border-purple-200 text-purple-900/40 transition hover:border-purple-400"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <span className="flex flex-col items-center gap-0.5 text-[0.65rem]">
                <Upload className="h-4 w-4" /> Add
              </span>
            )}
          </button>
        )}
      </div>
      <p className="mt-1.5 text-[0.7rem] text-purple-900/45">
        {imgs.length}/{max} images. {imgs.length > 1 && "They auto-slide on the page."}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => add(e.target.files)}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
