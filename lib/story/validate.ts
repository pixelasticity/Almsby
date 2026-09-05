/**
 * Pure validation for story-page CMS fields.
 *
 * Kept free of DB/env/auth so it's unit-testable without mocks (same pattern
 * as lib/products/validate.ts). Server actions in story/actions.ts call this
 * and return a user-safe error map on failure.
 *
 * Accepts Partial<StoryFormValues> so a per-step wizard can validate just the
 * current step's slice — the save action only passes what's on screen.
 */

import type { StoryBlock } from "@/lib/story/queries";

export type StoryFormValues = {
  headline?: string | null;
  bodyContent?: string | null; // serialized JSON from the block editor
  photos?: string[];
};

/** Max headline length (generous — covers long product names). */
const MAX_HEADLINE_LENGTH = 200;

/** Max blocks in a story body (unbounded growth would bloat the page). */
const MAX_STORY_BLOCKS = 100;

/** Max characters per block (prevents a single pasted megablock). */
const MAX_BLOCK_TEXT_LENGTH = 10000;

/** Max photos a story can hold (keeps the grid manageable). */
const MAX_PHOTOS = 12;

/** Max public URL length to store (sanity cap on R2 key paths). */
const MAX_PHOTO_URL_LENGTH = 2048;

/**
 * Parse + validate the serialized block editor JSON.
 * Returns structured StoryBlock[] on success, throws a user-readable error.
 * Accepts either the wire format (JSON string from the editor) or an
 * already-parsed array (Prisma's JsonValue when loading a stored story).
 */
export function parseBodyContent(raw: unknown): { type: "heading" | "paragraph"; text: string }[] {
  if (raw === null || raw === undefined || raw === "") {
    return [];
  }

  if (typeof raw !== "string" && !Array.isArray(raw)) {
    throw new Error("Story content must be text.");
  }

  let parsed: unknown;
  if (Array.isArray(raw)) {
    parsed = raw;
  } else {
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Story content could not be read.");
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Story content must be a list of blocks.");
  }

  if (parsed.length > MAX_STORY_BLOCKS) {
    throw new Error(`A story can have at most ${MAX_STORY_BLOCKS} blocks.`);
  }

  const blocks = parsed as unknown[];
  const result: { type: "heading" | "paragraph"; text: string }[] = [];

  for (const block of blocks) {
    if (typeof block !== "object" || block === null || !("type" in block) || !("text" in block)) {
      throw new Error("Each story block must have a type and text.");
    }
    const b = block as { type: unknown; text: unknown };
    if (b.type !== "heading" && b.type !== "paragraph") {
      throw new Error("Story blocks can only be 'heading' or 'paragraph'.");
    }
    if (typeof b.text !== "string") {
      throw new Error("Story block text must be text.");
    }
    if (b.text.length > MAX_BLOCK_TEXT_LENGTH) {
      throw new Error(`Each story block must be at most ${MAX_BLOCK_TEXT_LENGTH} characters.`);
    }
    result.push({ type: b.type, text: b.text });
  }

  return result;
}

/**
 * Validate a partial set of story fields for a draft or publish attempt.
 * Returns a normalized shape ready for the DB upsert, or throws.
 * bodyContent is typed StoryBlock[] (JSON-serializable) so spreading into
 * Prisma's upsert type-checks without a cast.
 */
export function validateStoryFields(values: StoryFormValues): {
  headline: string | null;
  bodyContent: StoryBlock[] | null;
  photos: string[];
} {
  const { headline, bodyContent, photos } = values;

  // --- headline ---
  let normalizedHeadline: string | null = null;
  if (headline !== undefined && headline !== null) {
    const trimmed = headline.trim();
    if (trimmed.length > MAX_HEADLINE_LENGTH) {
      throw new Error(`Headline can be at most ${MAX_HEADLINE_LENGTH} characters.`);
    }
    normalizedHeadline = trimmed.length > 0 ? trimmed : null;
  }

  // --- bodyContent (validated + parsed to structured blocks) ---
  let parsedBody: StoryBlock[] | null = null;
  if (bodyContent !== undefined && bodyContent !== null) {
    parsedBody = parseBodyContent(bodyContent);
  }

  // --- photos ---
  let normalizedPhotos: string[] = [];
  if (photos !== undefined && photos !== null) {
    if (!Array.isArray(photos)) {
      throw new Error("Photos must be a list.");
    }
    if (photos.length > MAX_PHOTOS) {
      throw new Error(`A story can have at most ${MAX_PHOTOS} photos.`);
    }
    for (const url of photos) {
      if (typeof url !== "string") {
        throw new Error("Each photo URL must be text.");
      }
      if (url.length > MAX_PHOTO_URL_LENGTH) {
        throw new Error("Photo URL is too long.");
      }
      // Reject anything that's not a clean https URL (prevents storing garbage or
      // relative paths that break the public page's image tags).
      if (!/^https:\/\/[^\s]+$/.test(url)) {
        throw new Error("Each photo must be a valid https URL.");
      }
    }
    normalizedPhotos = photos;
  }

  return {
    headline: normalizedHeadline,
    bodyContent: parsedBody,
    photos: normalizedPhotos,
  };
}
