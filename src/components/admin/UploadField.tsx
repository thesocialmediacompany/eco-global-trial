"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, FileText } from "lucide-react";

interface Props {
  /** hidden input name that receives the uploaded file URL */
  name: string;
  kind?: "image" | "pdf";
  label?: string;
  /** optional hidden input name to receive a human-readable size like "2.4 MB" */
  sizeName?: string;
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Single-file uploader used inside server-action forms. Uploads to
 * /api/admin/upload and writes the resulting URL into a hidden field the
 * surrounding <form> submits.
 */
export function UploadField({ name, kind = "image", label, sizeName }: Props) {
  const [url, setUrl] = useState("");
  const [size, setSize] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      // Prefer a presigned direct-to-S3 upload (bypasses the WAF/body limit);
      // fall back to a multipart POST when S3 isn't configured (local dev).
      const pres = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, kind }),
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
        setUrl(info.publicUrl);
      } else {
        const fd = new FormData();
        fd.append("file", file);
        if (kind === "pdf") fd.append("kind", "pdf");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || "Upload failed");
        }
        setUrl((await res.json()).url);
      }
      setSize(humanSize(file.size));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && <p className="mb-1.5 text-xs font-medium text-purple-900/70">{label}</p>}
      <input type="hidden" name={name} value={url} />
      {sizeName && <input type="hidden" name={sizeName} value={size} />}

      {url ? (
        <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-cream/40 p-2">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="upload" className="h-12 w-12 rounded object-cover" />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded bg-rose-50 text-rose-600">
              <FileText className="h-6 w-6" />
            </span>
          )}
          <span className="flex-1 truncate text-xs text-purple-900/70">
            {url.split("/").pop()} {size && `· ${size}`}
          </span>
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setSize("");
            }}
            className="grid h-7 w-7 place-items-center rounded text-rose-600 hover:bg-rose-50"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-purple-200 bg-cream/40 px-4 py-3 text-sm text-purple-900/50 transition hover:border-purple-400"
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {kind === "pdf" ? "Upload PDF" : "Upload image"}
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={kind === "pdf" ? "application/pdf" : "image/*"}
        hidden
        onChange={(e) => onPick(e.target.files)}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
