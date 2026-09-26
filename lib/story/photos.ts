/**
 * Story photo metadata — what a photo SHOWS, and what the maker says about it.
 *
 * StoryPage.photos is a Json column holding StoryPhoto[] (see migration
 * 20260926120000). A bare URL could only ever render as a generic grid; the
 * roles below are what let the page tell a shopper "this is the raw fibre",
 * "this is the workshop", "this is the finished piece being worn" — the
 * difference between a photo dump and a story.
 *
 * Two entry points, deliberately asymmetric:
 *   - validateStoryPhotos — WRITE path. Strict; returns a user-safe error plus
 *     the offending entry so the caller can log evidence.
 *   - normalizeStoryPhotos — READ path. Never throws, and never drops a maker's
 *     photo because of a bad tag: it repairs what it can trust and logs what it
 *     could not.
 *
 * Both enforce the same URL rule as before: only URLs this system produced (our
 * own R2 host under story-photos/) may reach a page that renders <img src>.
 * Same discipline as the TipTap link allowlist — refuse on write what the render
 * path would otherwise have to keep neutralizing.
 */
import { env } from "@/lib/env";
import { MAX_STORY_PHOTOS, STORY_PHOTO_DIR } from "@/lib/story/photoTypes";

/**
 * The five narrative roles, in the order a story usually tells itself.
 *
 * Bounded on purpose (no free-text categories): a fixed vocabulary is what makes
 * the gallery legible and translatable, and it keeps makers from inventing
 * categories no shopper would understand.
 */
export const PHOTO_ROLES = [
  "materials", // unprocessed components, ingredients, or raw fabrics before assembly
  "process", // crafting, machining, or assembly steps in action
  "details", // close-ups of textures, finishes, hardware, or stitching
  "makers", // portraits of the artisans, founders, or workshop team
  "in_use", // real-world context: the finished product worn, held, or used
] as const;

export type PhotoRole = (typeof PHOTO_ROLES)[number];

/** Caption ceiling — a caption is a line of context, not a second story page. */
export const MAX_PHOTO_CAPTION_LENGTH = 160;

export type StoryPhoto = {
  url: string;
  /**
   * Absent until the maker picks one. Legacy rows arrive without a role, and the
   * gallery renders no badge for those rather than inventing a claim about an
   * image whose subject we do not know.
   */
  role?: PhotoRole;
  /** Short maker commentary, shown under the photo. */
  caption?: string;
};

export function isPhotoRole(value: unknown): value is PhotoRole {
  return (
    typeof value === "string" && (PHOTO_ROLES as readonly string[]).includes(value)
  );
}

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
  | { ok: true; photos: StoryPhoto[] }
  | { ok: false; error: string; offending: string };

/**
 * Alt text for a photo, in priority order: the maker's caption (their words,
 * verbatim) → the role label ("Process") → a generic fallback. Pure, so the
 * priority itself is tested rather than assumed — screen-reader users get the
 * most specific description available for every photo.
 */
export function photoAltText(
  photo: StoryPhoto,
  roleLabel: string | undefined,
  fallback: string
): string {
  const caption = photo.caption?.trim();
  return caption || roleLabel || fallback;
}

/** Why an entry could not be trusted — mapped to user-safe copy on the write path. */
export type PhotoProblem = "shape" | "url" | "role" | "captionLength";

type ParsedPhotoEntry =
  | { ok: true; photo: StoryPhoto }
  | {
      ok: false;
      problem: PhotoProblem;
      offending: string;
      /**
       * What could still be trusted: the URL, plus any field that validated
       * before the failure. This single field separates the two callers'
       * behavior — the write path rejects any failure, while the read path keeps
       * `salvaged` (an untrusted URL is null here and must never render).
       *
       * It is built progressively on purpose: a photo with a valid role and an
       * over-long caption keeps its role. Dropping verified fields along with the
       * bad one would lose the maker's work for no gain.
       */
      salvaged: StoryPhoto | null;
    };

/** Short, throw-free description of a bad value, for logs the maker never sees. */
function describeValue(value: unknown): string {
  if (typeof value === "string") return value.slice(0, 200);
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return String(value);
}

/**
 * One stored/sent entry → StoryPhoto, or the reason it cannot be trusted.
 *
 * Shared by both paths so "what a valid photo entry is" has exactly one
 * definition. Empty role/caption are omitted rather than stored as "" — an
 * absent field and an empty one should not be two states in the database.
 */
function parsePhotoEntry(entry: unknown, prefix: string): ParsedPhotoEntry {
  // Legacy shape: a bare URL, from before roles existed.
  if (typeof entry === "string") {
    if (!entry.startsWith(prefix)) {
      return { ok: false, problem: "url", offending: entry, salvaged: null };
    }
    return { ok: true, photo: { url: entry } };
  }

  if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
    return {
      ok: false,
      problem: "shape",
      offending: describeValue(entry),
      salvaged: null,
    };
  }

  const record = entry as Record<string, unknown>;
  const url = record.url;
  if (typeof url !== "string" || !url.startsWith(prefix)) {
    return {
      ok: false,
      problem: "url",
      offending: typeof url === "string" ? url : describeValue(record.url),
      salvaged: null,
    };
  }

  // From here on the image itself is trusted, so every failure keeps `photo`
  // (with whatever has validated so far) as the salvageable remainder.
  const photo: StoryPhoto = { url };

  const role = record.role;
  if (role !== undefined && role !== null && role !== "") {
    if (!isPhotoRole(role)) {
      return { ok: false, problem: "role", offending: describeValue(role), salvaged: photo };
    }
    photo.role = role;
  }

  const caption = record.caption;
  if (caption !== undefined && caption !== null) {
    if (typeof caption !== "string") {
      return {
        ok: false,
        problem: "captionLength",
        offending: describeValue(caption),
        salvaged: photo,
      };
    }
    const trimmed = caption.trim();
    if (trimmed.length > MAX_PHOTO_CAPTION_LENGTH) {
      return {
        ok: false,
        problem: "captionLength",
        offending: `${trimmed.length} characters`,
        salvaged: photo,
      };
    }
    if (trimmed) photo.caption = trimmed;
  }

  return { ok: true, photo };
}

/** User-safe copy per problem — never the internal reason, never a raw value. */
const WRITE_ERRORS: Record<PhotoProblem, string> = {
  shape:
    "One of the photos could not be verified. Remove it and upload it again.",
  url: "One of the photos could not be verified. Remove it and upload it again.",
  role: "One of the photos has a category we don't recognise. Choose it again and save.",
  captionLength: `Captions can be up to ${MAX_PHOTO_CAPTION_LENGTH} characters.`,
};

/**
 * WRITE path. Accepts whatever a browser sends and returns the canonical stored
 * shape, or a user-safe error naming the offending entry for the log.
 *
 * Permissive in, strict out:
 *   - null/undefined is "no photos" (a story saved before photos existed);
 *   - a BARE URL string is accepted and upgraded to an object, because a maker's
 *     tab opened before a deploy keeps sending the old shape — failing their save
 *     over a shape we can upgrade ourselves would be our bug, not theirs;
 *   - what gets STORED is always structured objects, with duplicates collapsed.
 */
export function validateStoryPhotos(value: unknown): StoryPhotosResult {
  if (value === null || value === undefined) return { ok: true, photos: [] };

  if (!Array.isArray(value)) {
    return {
      ok: false,
      error: "The photos could not be read. Please refresh and try again.",
      offending: `non-array (${describeValue(value)})`,
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
  const photos: StoryPhoto[] = [];

  for (const entry of value) {
    const parsed = parsePhotoEntry(entry, prefix);
    if (!parsed.ok) {
      return {
        ok: false,
        error: WRITE_ERRORS[parsed.problem],
        offending: `${parsed.problem}: ${parsed.offending}`,
      };
    }
    if (!photos.some((existing) => existing.url === parsed.photo.url)) {
      photos.push(parsed.photo);
    }
  }

  return { ok: true, photos };
}

/**
 * READ path. Turns whatever is stored into renderable StoryPhoto[] without ever
 * throwing and without hiding a maker's photo because of a bad tag.
 *
 * Repair vs drop is decided by whether the URL itself was trusted:
 *   - untrusted URL or wrong shape → DROPPED, with the value logged. This is the
 *     rule that keeps an arbitrary remote resource off a consumer's page.
 *   - unknown role or an over-long caption → the PHOTO IS KEPT with everything
 *     that did validate (a bad caption does not cost the role), and the reason is
 *     logged. Losing a caption is a papercut; hiding the maker's image from their
 *     live page is not.
 *
 * The cap is enforced by slicing, not by failing: this runs on the public page,
 * where the only sane response to bad data is to show less of it.
 */
export function normalizeStoryPhotos(value: unknown): StoryPhoto[] {
  if (value === null || value === undefined) return [];

  if (!Array.isArray(value)) {
    console.error(
      `normalizeStoryPhotos: expected an array, got ${describeValue(value)} — rendering no photos.`
    );
    return [];
  }

  const prefix = storyPhotoUrlPrefix();
  const photos: StoryPhoto[] = [];

  for (const entry of value) {
    const parsed = parsePhotoEntry(entry, prefix);

    if (parsed.ok) {
      if (!photos.some((existing) => existing.url === parsed.photo.url)) {
        photos.push(parsed.photo);
      }
      continue;
    }

    if (parsed.salvaged) {
      console.error(
        `normalizeStoryPhotos: ${parsed.problem} (${parsed.offending}) — keeping the photo without that detail.`
      );
      if (!photos.some((existing) => existing.url === parsed.salvaged?.url)) {
        photos.push(parsed.salvaged);
      }
      continue;
    }

    console.error(
      `normalizeStoryPhotos: dropping an unrenderable photo entry — ${parsed.problem}: ${parsed.offending}`
    );
  }

  if (photos.length > MAX_STORY_PHOTOS) {
    console.error(
      `normalizeStoryPhotos: ${photos.length} photos exceeds the cap of ${MAX_STORY_PHOTOS} — rendering the first ${MAX_STORY_PHOTOS}.`
    );
    return photos.slice(0, MAX_STORY_PHOTOS);
  }

  return photos;
}
