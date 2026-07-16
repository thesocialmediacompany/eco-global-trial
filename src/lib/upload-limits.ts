/**
 * Client-safe upload limits (no server-only imports), shared by the admin
 * uploader components so the friendly size check matches the server. With the
 * direct-to-S3 flow these are generous - raise if you need larger source files.
 */
export const MAX_UPLOAD_MB = 25;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export function tooLargeMessage(fileName: string, bytes: number) {
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return `"${fileName}" is ${mb} MB — the maximum is ${MAX_UPLOAD_MB} MB.`;
}
