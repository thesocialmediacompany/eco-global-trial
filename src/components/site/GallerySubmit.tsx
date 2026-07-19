"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, CheckCircle2, X } from "lucide-react";

type Phase = "idle" | "form" | "uploading" | "done" | "error";

const MAX_BYTES = 8 * 1024 * 1024;

export function GallerySubmit() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    if (file.size > MAX_BYTES) return setError("Please choose an image under 8 MB.");
    setPreview(URL.createObjectURL(file));
    setPhase("uploading");
    try {
      const pres = await fetch("/api/gallery/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!pres.ok) throw new Error((await pres.json().catch(() => ({}))).error || "Upload failed");
      const { url, fields, publicUrl: pub } = await pres.json();

      const fd = new FormData();
      Object.entries(fields as Record<string, string>).forEach(([k, v]) => fd.append(k, v));
      fd.append("file", file);
      const put = await fetch(url, { method: "POST", body: fd });
      if (!put.ok) throw new Error("Upload failed. Please try again.");

      setPublicUrl(pub);
      setPhase("form");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setPhase("error");
    }
  }

  async function submit() {
    setPhase("uploading");
    setError("");
    try {
      const res = await fetch("/api/gallery/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: publicUrl, caption, name, website }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Could not submit");
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit");
      setPhase("form");
    }
  }

  function reset() {
    setPhase("idle");
    setPreview("");
    setPublicUrl("");
    setCaption("");
    setName("");
    setError("");
  }

  if (phase === "done") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
        <p className="mt-2 font-display text-lg font-semibold text-purple-900">Thank you! 🌿</p>
        <p className="mt-1 text-sm text-purple-900/70">
          Your photo has been submitted. It&apos;ll appear here once our team approves it.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-full border border-purple-200 px-4 py-1.5 text-sm font-semibold text-purple-900 hover:bg-purple-50"
        >
          Share another
        </button>
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <button
        onClick={() => setPhase("form")}
        className="inline-flex items-center gap-2 rounded-full gradient-purple-green px-5 py-2.5 text-sm font-semibold text-cream shadow-sm"
      >
        <Camera className="h-4 w-4" /> Share your photo
      </button>
    );
  }

  return (
    <div className="relative rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
      <button
        onClick={reset}
        aria-label="Close"
        className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-purple-900/40 hover:bg-purple-50"
      >
        <X className="h-4 w-4" />
      </button>
      <h3 className="font-display text-lg font-semibold text-purple-900">Share your photo</h3>
      <p className="mt-1 text-sm text-purple-900/60">
        Snap your Eco Global Foods products at home or in-store. We review every photo before it
        goes live.
      </p>

      {/* honeypot: hidden from real users */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute left-[-9999px]"
        aria-hidden
      />

      <div className="mt-4">
        {preview ? (
          <div className="relative h-44 w-44 overflow-hidden rounded-xl border border-purple-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Your photo" className="h-full w-full object-cover" />
            {phase === "uploading" && (
              <div className="absolute inset-0 grid place-items-center bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInput.current?.click()}
            className="grid h-44 w-44 place-items-center rounded-xl border-2 border-dashed border-purple-200 text-purple-900/40 transition hover:border-purple-400"
          >
            <span className="flex flex-col items-center gap-1 text-sm">
              <Camera className="h-6 w-6" /> Choose a photo
            </span>
          </button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      {publicUrl && (
        <div className="mt-4 space-y-3">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={280}
            placeholder="Add a caption (optional) — how do you use it?"
            className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-400"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Your name (optional)"
            className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-400"
          />
          <button
            onClick={submit}
            disabled={phase === "uploading"}
            className="inline-flex items-center gap-2 rounded-full gradient-purple-green px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
          >
            {phase === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit for review
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
