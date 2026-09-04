/**
 * Story-page photo upload to Cloudflare R2.
 *
 * R2 was chosen for story pages specifically because it has no egress fees
 * (architecture doc §stack) — the story page is the highest-traffic surface in
 * the product, and every photo served to a consumer is egress. Keeping uploads
 * here also keeps the maker dashboard's DB + storage concerns separate.
 *
 * FAIL-LOUD CONTRACT (AGENTS.md rule #1, the bug class that cost this project
 * real debugging time twice):
 *   1. Validation layer — bad type/size/bytes throw immediately, before any
 *      network call.
 *   2. Upload layer — a failed PutObjectCommand (network, bad credentials, wrong
 *      bucket, 4xx/5xx) PROPAGATES uncaught out of uploadStoryPhoto. The caller
 *      (the CMS server action, #72) is the boundary that console.errors the
 *      original error and returns a user-safe failure. uploadStoryPhoto NEVER
 *      returns a URL the object wasn't actually written to — no fallback URL,
 *      no empty string, no null masquerading as success.
 */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { env } from "@/lib/env";

/** Allowed content types (and their extensions) for story photos. */
export const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

/** Max bytes for a single story photo. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

const PHOTO_DIR = "story-photos";

/** Human-safe extension for a content type, or "bin" when unknown. */
function extensionForContentType(contentType: string): string {
  const ext = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  }[contentType];
  return ext ?? "bin";
}

/**
 * Pure validation for a client-supplied photo file. Throws a user-readable
 * error when the file can't be stored; returns a normalized descriptor when
 * valid. Kept free of env/S3 so it's unit-testable without mocks.
 */
export function validatePhotoFile(input: {
  bytes: Uint8Array;
  filename: string;
  contentType: string;
}): { bytes: Uint8Array; filename: string; contentType: string } {
  if (!input.contentType || !ALLOWED_PHOTO_TYPES.has(input.contentType)) {
    throw new Error(
      `Unsupported image type "${input.contentType}". Use JPEG, PNG, WebP, AVIF, or GIF.`
    );
  }
  if (!input.bytes || input.bytes.length === 0) {
    throw new Error("The uploaded file is empty.");
  }
  if (input.bytes.length > MAX_PHOTO_BYTES) {
    throw new Error("The uploaded image is larger than 5 MB.");
  }

  const base = path.basename(input.filename || "photo", path.extname(input.filename));
  // Strip anything that isn't alphanumeric/-/_ so the object key stays clean.
  const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 60) || "photo";
  return {
    bytes: input.bytes,
    filename: `${safeBase}.${extensionForContentType(input.contentType)}`,
    contentType: input.contentType,
  };
}

/** Lazily-created R2 S3 client, reused across uploads. */
let r2Client: S3Client | null = null;
function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.r2AccessKeyId,
        secretAccessKey: env.r2SecretAccessKey,
      },
    });
  }
  return r2Client;
}

export type UploadStoryPhotoInput = {
  bytes: Uint8Array;
  filename: string;
  contentType: string;
  productId: string;
};

/**
 * Upload a validated story photo to R2 and return its public URL.
 *
 * Throws on invalid input (validation layer) and on any S3 failure (upload
 * layer — see the fail-loud contract above). Never resolves to a URL the bytes
 * weren't actually written to.
 */
export async function uploadStoryPhoto(
  input: UploadStoryPhotoInput
): Promise<string> {
  const { bytes, filename, contentType } = validatePhotoFile(input);

  const key = `${PHOTO_DIR}/${input.productId}/${randomUUID()}-${filename}`;
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: env.r2BucketName,
      Key: key,
      Body: Buffer.from(bytes),
      ContentType: contentType,
    })
  );

  return `https://${env.r2PublicDomain}/${key}`;
}