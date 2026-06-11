import "server-only";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Pluggable file storage. The default `local` provider writes to
 * `public/uploads` and returns a same-origin URL - works on any Node host
 * (VPS, self-hosted). For serverless (Vercel) or scale, implement a cloud
 * provider (S3 / Cloudinary / Vercel Blob) with the same interface and switch
 * `getStorage()` based on an env flag - callers don't change.
 */

export interface SavedFile {
  url: string;
}

export interface StorageProvider {
  save(file: { buffer: Buffer; filename: string; contentType: string }): Promise<SavedFile>;
}

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, "") : "";
  return `${randomUUID()}${ext || ".bin"}`;
}

export const localStorageProvider: StorageProvider = {
  async save({ buffer, filename }) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = safeName(filename);
    await writeFile(join(UPLOAD_DIR, name), buffer);
    return { url: `/uploads/${name}` };
  },
};

// To enable a cloud provider later:
//   export const s3Provider: StorageProvider = { async save(file) { /* PutObject */ } };
// then return it from getStorage() when process.env.STORAGE_DRIVER === "s3".
export function getStorage(): StorageProvider {
  return localStorageProvider;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
