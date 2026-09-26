/**
 * Client-side photo compression — runs in the browser, before upload.
 *
 * WHY: makers photograph on phones. Modern phone JPEGs are 8–20 MB, and a maker
 * should be able to drag one straight in without meeting a "file too large"
 * wall. The browser downscales and re-encodes locally, so:
 *   - the upload is small enough for MAX_PHOTO_BYTES (5 MB) to stay a strict
 *     server contract rather than something we coax users past; and
 *   - nothing large is ever put on the wire from a phone on cellular.
 *
 * Deliberately NOT a general image pipeline: no cropping, no format conversion
 * for its own sake, no metadata claims. A file that already fits is passed
 * through UNTOUCHED (byte-identical, zero quality loss) — re-encoding an image
 * that was already fine would be a silent quality tax, and a re-encode that
 * makes a file bigger is discarded rather than sent.
 *
 * Failure policy (AGENTS.md rule 1 — never fail silently): if the browser cannot
 * decode or draw the file, the ORIGINAL file is returned and the server's
 * validation still runs — server validation, not this module, is the boundary
 * that decides what may be stored. The reason is logged, never swallowed.
 */
import {
  ALLOWED_PHOTO_TYPES,
  MAX_SOURCE_BYTES,
} from "@/lib/story/photoTypes";

/** Target ceiling for what we put on the wire — under MAX_PHOTO_BYTES, with
 *  headroom for multipart overhead and encoder variance. */
export const COMPRESS_TARGET_BYTES = 4.5 * 1024 * 1024; // 4.5 MB

/** Longest edge kept after downscaling. 2560px is sharp on any phone or laptop
 *  screen a story page is read on, at a fraction of the bytes. */
export const MAX_DIMENSION = 2560;

/** JPEG qualities tried in order until the result fits the target. */
const QUALITY_STEPS = [0.85, 0.7];

/** A decode that never settles (corrupt file, stalled blob read) must not leave
 *  the uploader spinning forever — it falls back to the original file instead. */
const DEFAULT_DECODE_TIMEOUT_MS = 10_000;

/**
 * Scales width/height to fit inside a maxDim box, preserving aspect ratio.
 * Pure — the part of this module worth pinning in tests.
 */
export function calculateFitDimensions(
  width: number,
  height: number,
  maxDim: number = MAX_DIMENSION
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  if (width <= maxDim && height <= maxDim) return { width, height };
  const scale = maxDim / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** True for a file the uploader may attempt (type allowlist + source size cap). */
export function isAcceptableSource(file: File): boolean {
  return ALLOWED_PHOTO_TYPES.has(file.type) && file.size <= MAX_SOURCE_BYTES;
}

export type CompressResult = {
  file: File;
  /** True when the bytes were re-encoded (lets the UI be honest about it). */
  compressed: boolean;
};
/**
 * Compresses `file` when it exceeds the target size; otherwise returns it
 * untouched. Never throws: on any failure the original file is returned so the
 * server stays the single authority on what may be stored.
 */
export async function compressPhotoIfNeeded(
  file: File,
  options: { decodeTimeoutMs?: number } = {}
): Promise<CompressResult> {
  const passthrough: CompressResult = { file, compressed: false };

  if (file.size <= COMPRESS_TARGET_BYTES) return passthrough;
  if (file.size > MAX_SOURCE_BYTES) return passthrough;
  // Server-side render, or a test environment with no DOM to draw into.
  if (typeof document === "undefined") return passthrough;

  try {
    const decoded = await decodeImage(
      file,
      options.decodeTimeoutMs ?? DEFAULT_DECODE_TIMEOUT_MS
    );
    const { width, height } = calculateFitDimensions(decoded.width, decoded.height);
    if (!width || !height) {
      closeIfBitmap(decoded.source);
      return passthrough;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      closeIfBitmap(decoded.source);
      return passthrough;
    }

    ctx.drawImage(decoded.source, 0, 0, width, height);
    closeIfBitmap(decoded.source);

    let blob: Blob | null = null;
    for (const quality of QUALITY_STEPS) {
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
      if (blob && blob.size <= COMPRESS_TARGET_BYTES) break;
    }

    if (!blob || blob.size === 0 || blob.size > COMPRESS_TARGET_BYTES) {
      console.error(
        `compressPhotoIfNeeded: re-encode did not fit the target for ${file.name}; sending the original (${file.size} bytes) for server validation.`
      );
      return passthrough;
    }

    // A re-encode that grew the file is not worth sending.
    if (blob.size >= file.size) return passthrough;

    return {
      file: new File([blob], toJpegName(file.name), {
        type: "image/jpeg",
        lastModified: Date.now(),
      }),
      compressed: true,
    };
  } catch (error) {
    // Fail loud, then continue with the original: the server's validation and
    // its user-safe message stay the boundary, never this module's silence.
    console.error(
      `compressPhotoIfNeeded: could not compress ${file.name} (${file.size} bytes); falling back to the original.`,
      error
    );
    return passthrough;
  }
}

/** JPEG has no alpha: a re-encoded PNG/WebP becomes a .jpg, so the name follows. */
function toJpegName(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "") || "photo";
  return `${base}.jpg`;
}

function closeIfBitmap(source: CanvasImageSource): void {
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    source.close();
  }
}

/**
 * Decodes a file to something drawable, preferring createImageBitmap (fast, and
 * off the main thread on most browsers) with an <img> fallback for older Safari.
 * The timeout is the guard against a decode that never settles.
 */
async function decodeImage(
  file: File,
  timeoutMs: number
): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await withTimeout(createImageBitmap(file), timeoutMs);
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch (error) {
      // Some formats decode via <img> but not via createImageBitmap — fall
      // through rather than giving up on the file.
      console.error(
        `decodeImage: createImageBitmap failed for ${file.name}; trying <img>.`,
        error
      );
    }
  }

  const img = await withTimeout(loadImageElement(file), timeoutMs);
  return {
    source: img,
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
  };
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The image could not be decoded."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

