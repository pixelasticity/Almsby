/**
 * Photo rules shared by the CLIENT uploader and the SERVER storage layer.
 *
 * Constants only, no imports — that is the point. lib/story/storage.ts pulls in
 * the AWS SDK and must never reach the browser bundle, so the browser-side
 * uploader cannot import its constants from there. Keeping them here means the
 * type allowlist, size caps, and photo cap have exactly one definition that both
 * sides read.
 */

/** Accepted image mime types. */
export const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

/** Max bytes for a single STORED story photo (what R2 / the server enforces). */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Max bytes for a SELECTED source file, before client-side compression.
 *
 * Deliberately generous: a maker dragging in a phone or camera photo should not
 * have to think about it (the browser shrinks it to well under MAX_PHOTO_BYTES
 * before upload). The cap exists so one absurd input — a 200 MB RAW export —
 * cannot hang the tab while the canvas tries to decode it.
 */
export const MAX_SOURCE_BYTES = 25 * 1024 * 1024; // 25 MB

/** Object-key directory uploads are written under (R2). */
export const STORY_PHOTO_DIR = "story-photos";

/**
 * Max photos on one story page, enforced on the write path (see
 * lib/story/photos.ts) and pre-empted in the uploader UI. Bounded so the page a
 * shopper scans stays fast on a phone.
 */
export const MAX_STORY_PHOTOS = 12;
