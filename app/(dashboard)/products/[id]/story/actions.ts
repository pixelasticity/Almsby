"use server";

import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getOwnedProduct } from "@/lib/products/queries";
import { validateStoryFields } from "@/lib/story/validate";
import type { StoryBlock } from "@/lib/story/queries";
import { uploadStoryPhoto, validatePhotoFile } from "@/lib/story/storage";

export type StoryFormState = { error?: string };

/**
 * The data passed to saveStoryDraftAction / publishStoryAction.
 * Partial-merge contract: only provided fields are written, so a per-step
 * wizard can save headline alone, then body blocks alone, then photos alone.
 * The server action merges each provided field, leaving the rest untouched.
 */
export type StoryFormValues = {
  headline?: string | null;
  bodyContent?: string | null; // serialized JSON from the block editor
  photos?: string[];          // array of public R2 URLs
  published?: boolean;
};

/**
 * Ownership-checked update: writes only the provided fields to the product's StoryPage.
 * Partial-merge semantics: `undefined` = leave untouched, `null` = clear the
 * column (JSON columns need Prisma.DbNull for that), value = overwrite.
 */
async function upsertStoryPage(
  productId: string,
  updates: {
    headline?: string | null;
    bodyContent?: StoryBlock[] | null;
    photos?: string[];
    published?: boolean;
  }
) {
  const db = getDb();

  // Explicit field mapping — spread can't express "undefined = skip" for
  // Prisma's JSON input unions, and null needs DbNull there.
  const data: {
    headline?: string | null;
    bodyContent?: typeof Prisma.DbNull | StoryBlock[];
    photos?: string[];
    published?: boolean;
  } = {};
  if (updates.headline !== undefined) data.headline = updates.headline;
  if (updates.bodyContent !== undefined) {
    data.bodyContent =
      updates.bodyContent === null ? Prisma.DbNull : updates.bodyContent;
  }
  if (updates.photos !== undefined) data.photos = updates.photos;
  if (updates.published !== undefined) data.published = updates.published;

  // upsert handles the "create on first save" case so the wizard doesn't
  // need a separate creation step — first autosave creates the row.
  return db.storyPage.upsert({
    where: { productId },
    create: { productId, ...data },
    update: data,
  });
}

/**
 * Save draft for a step's worth of fields. Re-confirms ownership server-side
 * (the dashboard route's auth isn't sufficient — a forged form could target
 * any productId). Throws a user-safe error on failure, never leaks internals.
 */
export async function saveStoryDraftAction(
  productId: string,
  values: StoryFormValues
): Promise<StoryFormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to edit a story." };
  }

  // Ownership gate: product must belong to the signed-in user's business.
  const product = await getOwnedProduct(productId, user.id);
  if (!product) {
    return { error: "Product not found." };
  }

  try {
    const validated = validateStoryFields(values);
    await upsertStoryPage(productId, validated);
  } catch (error) {
    // Fail-loud contract (AGENTS.md rule #1): log the real error, return
    // a user-safe message. Never swallow or return empty/undefined.
    console.error(`saveStoryDraftAction failed for product ${productId}:`, error);
    return { error: "Could not save the story. Please try again." };
  }

  return {};
}

/**
 * Publish the story: validates headline (required to publish), sets
 * published=true. Separate from draft-save so the brief's
 * "headline required to publish" rule is enforced at the action boundary.
 */
export async function publishStoryAction(
  productId: string,
  values: StoryFormValues
): Promise<StoryFormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to publish a story." };
  }

  const product = await getOwnedProduct(productId, user.id);
  if (!product) {
    return { error: "Product not found." };
  }

  try {
    const validated = validateStoryFields(values);
    // Headline is required to publish (brief §4: "required to publish").
    if (!validated.headline) {
      return { error: "Add a headline before publishing." };
    }
    await upsertStoryPage(productId, { ...validated, published: true });
  } catch (error) {
    console.error(`publishStoryAction failed for product ${productId}:`, error);
    return { error: "Could not publish the story. Please try again." };
  }

  return {};
}

/**
 * Upload a single photo to R2. Validates + uploads server-side so R2
 * credentials never reach the browser. Re-confirms ownership via productId.
 * Returns the public URL on success, throws on any failure (fail-loud).
 * Input is a validated file descriptor (bytes/filename/contentType) — the
 * client runs validatePhotoFile first for instant feedback; this re-validates
 * server-side (never trust the client).
 */
export async function uploadStoryPhotoAction(
  productId: string,
  input: { bytes: Uint8Array; filename: string; contentType: string }
): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be signed in to upload photos.");
  }

  const product = await getOwnedProduct(productId, user.id);
  if (!product) {
    throw new Error("Product not found.");
  }

  // Server-side re-validation — the client-side check is UX only.
  const validated = validatePhotoFile({
    bytes: input.bytes,
    filename: input.filename,
    contentType: input.contentType,
  });

  return uploadStoryPhoto({
    bytes: validated.bytes,
    filename: validated.filename,
    contentType: validated.contentType,
    productId,
  });
}

/**
 * Publish/unpublish toggle (#73). Separate from publishStoryAction so a maker
 * can quickly toggle status from the product page without re-opening the wizard.
 */
export async function toggleStoryPublishedAction(
  productId: string,
  published: boolean
): Promise<StoryFormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to do that." };
  }

  const product = await getOwnedProduct(productId, user.id);
  if (!product) {
    return { error: "Product not found." };
  }

  const db = getDb();
  try {
    await db.storyPage.update({ where: { productId }, data: { published } });
  } catch (error) {
    // If the StoryPage row doesn't exist yet (maker toggles before saving
    // anything), upsert it so publish works from a fresh product page.
    console.error(`toggleStoryPublishedAction failed for product ${productId}:`, error);
    try {
      await db.storyPage.upsert({
        where: { productId },
        create: { productId, published },
        update: { published },
      });
    } catch (retryError) {
      console.error(`toggleStoryPublishedAction retry failed for product ${productId}:`, retryError);
      return { error: "Could not update the story. Please try again." };
    }
  }

  return {};
}
