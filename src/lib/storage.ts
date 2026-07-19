import "server-only";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Pluggable file storage. The default `local` provider writes to
 * `public/uploads` and returns a same-origin URL - works on any Node host
 * (VPS, self-hosted). Serverless hosts (AWS Amplify / Lambda, Vercel) have a
 * read-only / disposable filesystem, so uploads there MUST go to a cloud
 * provider - the S3 provider below is selected automatically when `S3_BUCKET`
 * is configured. Callers only ever touch `getStorage()`.
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

/**
 * Amazon S3 provider. Objects are stored under an `uploads/` prefix and served
 * publicly (configure the bucket policy for public GET on `uploads/*`, or front
 * it with CloudFront and set S3_PUBLIC_BASE_URL).
 *
 * Env:
 *   S3_BUCKET            - bucket name (presence of this switches storage to S3)
 *   S3_REGION            - e.g. "ap-south-1" (falls back to AWS_REGION)
 *   S3_ACCESS_KEY_ID     - IAM key with s3:PutObject on the bucket (optional if
 *   S3_SECRET_ACCESS_KEY   the Lambda execution role already grants access)
 *   S3_PUBLIC_BASE_URL   - optional CDN/custom-domain base for returned URLs
 */
function s3Region() {
  return process.env.S3_REGION || process.env.AWS_REGION || "us-east-1";
}

let _s3: S3Client | null = null;
function s3Client(): S3Client {
  if (!_s3) {
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    _s3 = new S3Client({
      region: s3Region(),
      // Explicit keys when provided; otherwise fall back to the default AWS
      // credential chain (e.g. the Amplify/Lambda execution role).
      credentials:
        accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    });
  }
  return _s3;
}

function s3PublicUrl(key: string) {
  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) return `${base}/${key}`;
  return `https://${process.env.S3_BUCKET}.s3.${s3Region()}.amazonaws.com/${key}`;
}

export const s3StorageProvider: StorageProvider = {
  async save({ buffer, filename, contentType }) {
    const key = `uploads/${safeName(filename)}`;
    await s3Client().send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return { url: s3PublicUrl(key) };
  },
};

/**
 * Pick the storage backend. S3 is used whenever `S3_BUCKET` is set (i.e. in
 * production on Amplify); otherwise the local-disk provider is used for
 * development on a normal filesystem.
 */
export function getStorage(): StorageProvider {
  if (process.env.S3_BUCKET) return s3StorageProvider;
  return localStorageProvider;
}

/** True when S3 is configured (production). */
export function s3Configured() {
  return Boolean(process.env.S3_BUCKET);
}

/**
 * Create a short-lived presigned PUT URL so the browser can upload a file
 * DIRECTLY to S3, bypassing the app server. This is essential on serverless
 * hosts (AWS Amplify) where the Lambda / WAF caps request bodies (WAF blocks
 * bodies over ~8 KB) - the bytes never pass through the app. Returns the URL to
 * PUT to plus the final public URL the file will live at.
 */
export async function createUploadUrl({
  filename,
  contentType,
}: {
  filename: string;
  contentType: string;
}): Promise<{ uploadUrl: string; publicUrl: string }> {
  const key = `uploads/${safeName(filename)}`;
  const cmd = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3Client(), cmd, { expiresIn: 120 });
  return { uploadUrl, publicUrl: s3PublicUrl(key) };
}

/**
 * Presigned POST for PUBLIC (customer) uploads to the community gallery.
 *
 * Unlike the admin PUT presign, this uses a POST policy so S3 itself enforces
 * the size cap and image content-type — the browser can't lie about either.
 * Files land under community/ with a random name (no overwrites), and nothing
 * is shown publicly until an admin approves it.
 */
export async function createCommunityUploadPost(contentType: string): Promise<{
  url: string;
  fields: Record<string, string>;
  publicUrl: string;
} | null> {
  if (!s3Configured()) return null;
  const { createPresignedPost } = await import("@aws-sdk/s3-presigned-post");
  const { randomUUID } = await import("node:crypto");
  const ext = contentType.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg";
  const key = `community/${randomUUID()}.${ext}`;
  const { url, fields } = await createPresignedPost(s3Client(), {
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Conditions: [
      ["content-length-range", 1, MAX_COMMUNITY_UPLOAD_BYTES],
      ["starts-with", "$Content-Type", "image/"],
    ],
    Fields: { "Content-Type": contentType },
    Expires: 120,
  });
  return { url, fields, publicUrl: s3PublicUrl(key) };
}

/** A URL is only a trusted community image if it lives in our own bucket. */
export function isOwnCommunityUrl(url: string): boolean {
  if (!url) return false;
  const base = s3PublicUrl("community/");
  return url.startsWith(base);
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB (high-res product photos)
export const MAX_COMMUNITY_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB for customer submissions

export const ALLOWED_DOC_TYPES = ["application/pdf"];
export const MAX_DOC_BYTES = 25 * 1024 * 1024; // 25 MB (catalogs / brochures)
