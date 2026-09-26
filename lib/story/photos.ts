/**
 * Write-side gate for StoryPage.photos.
 *
 * StoryPage.photos becomes <img src> on the PUBLIC page a shopper scans, so an
 * arbitrary string here is an arbitrary remote resource on a consumer-facing
 * surface (a third-party tracker, an off-domain image that can change later, or
 * a scheme the render path should never have to defend against). Only URLs this
 * system produced are accepted: our own R2 public host, under the story-photos/
 * directory uploadStoryPhoto writes to.
 *
 * Same discipline as the TipTap link allowlist (lib/story/markUtils.ts): the
 * WRITE path refuses what the render path would otherwise have to keep
 * neutralizing. The render path still treats stored values as untrusted — this
 * gate hardens the data, it does not excuse the renderer.
 */
import { env } from "@/lib/env";
import { MAX_STORY_PHOTOS, STORY_PHOTO_DIR } from "@/lib/story/photoTypes";

/**
 * The only URL prefix uploadStoryPhoto ever returns.
 *
 * Domain-aware via env (R2_PUBLIC_DOMAIN differs per environment) and never
 * hardcoded — dev writes to an *.r2.dev host, production to the bucket's custom
 * domain.
 */
export function storyPhotoUrlPrefix(): string {
  return `https://${env.r2PublicDomain}/${STORY_PHOTO_DIR}/`;
}

export type StoryPhotosResult =
  | { ok: true; photos: string[] }
  | { ok: false; error: string; offending: string };

/**
 * Validates a client-supplied photo list. Returns a user-safe error plus the
 * offending value (for the caller to log as evidence) instead of throwing, so
 * each action keeps its own copy and log line — same shape as loadStoryInput.
 *
 * null/undefined is a legitimate "no photos" (a story saved before photos
 * existed), NOT an error. Duplicates are collapsed: the same URL twice would
 * render the same image twice and is never intentional.
 */
export function validateStoryPhotos(value: unknown): StoryPhotosResult {
  if (value === null || value === undefined) return { ok: true, photos: [] };

  if (!Array.isArray(value)) {
    return {
      ok: false,
      error: "The photos could not be read. Please refresh and try again.",
      offending: `non-array (${typeof value})`,
    };
  }

  if (value.length > MAX_STORY_PHOTOS) {
    return {
      ok: false,
      error: `You can add up to ${MAX_STORY_PHOTOS} photos.`,
      offending: `${value.length} entries`,
    };
  }

  const prefix = storyPhotoUrlPrefix();
  const photos: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.startsWith(prefix)) {
      return {
        ok: false,
        error:
          "One of the photos could not be verified. Remove it and upload it again.",
        offending: typeof item === "string" ? item : String(item),
      };
    }
    if (!photos.includes(item)) photos.push(item);
  }

  return { ok: true, photos };
}
