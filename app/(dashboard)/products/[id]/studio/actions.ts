"use server";

import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { optionalInput } from "@/lib/input";
import { getOwnedProduct } from "@/lib/products/queries";
import { normalizeTipTapContent, type TipTapDoc } from "@/lib/story/tiptap";

export type StudioActionState = { error?: string };

/** A validated story write: the normalized headline + doc, or a user-safe error. */
type StoryInput =
  | { ok: true; headline: string | null; doc: TipTapDoc | null }
  | { ok: false; error: string };

/**
 * The gate + payload normalization both story actions share: session,
 * ownership, TipTap shape, headline. Extracted so save and publish can never
 * drift — a guard added to one path but not the other is the bug class that
 * would let unreadable content into StoryPage.bodyContent. Returns an error
 * string instead of throwing so each action keeps its own copy and log line.
 */
async function loadStoryInput(
  productId: string,
  content: Record<string, unknown> | null,
  headline: string | null,
  authError: string
): Promise<StoryInput> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: authError };

  // Ownership gate: only the product's owner may write its StoryPage.
  const owned = await getOwnedProduct(productId, user.id);
  if (!owned) return { ok: false, error: "Product not found." };

  // The editor always emits a TipTap doc on update, but a malformed/legacy
  // value (or a tampered client) must never be written — that would crash the
  // editor on the next load with "config.doc.type is undefined". null is a
  // legitimate "clear" save.
  const doc = normalizeTipTapContent(content);
  if (content != null && doc === null) {
    return {
      ok: false,
      error: "Story content could not be read. Please refresh and try again.",
    };
  }

  // Headline is trimmed and empty-collapsed to null server-side too — the
  // client's normalization is a convenience, never a trust boundary.
  return { ok: true, headline: optionalInput(headline), doc };
}

/**
 * Normalized TipTap doc → StoryPage.bodyContent. The single place the
 * unconstrained Json? column's input is built.
 *
 * A "clear" save (doc === null) must be Prisma.DbNull: Prisma rejects plain JS
 * `null` for nullable Json fields at runtime ("Argument bodyContent must not
 * be null …"), which the old `as unknown` cast hid from the compiler and turned
 * into a generic "Could not save the story" on every clear. DbNull stores SQL
 * NULL, which reads back as null through normalizeTipTapContent on every load
 * path. The non-null cast remains only because TipTapDoc's optional attrs don't
 * structurally match Prisma's index-signature Json input — the runtime values
 * are plain JSON either way.
 *
 * (Type-level fix; needs one manual clear-save check in the studio against a
 * live DB, since Prisma's runtime arg validation can't run without one.)
 */
function toBodyContent(
  doc: TipTapDoc | null
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  if (doc === null) return Prisma.DbNull;
  return doc as unknown as Prisma.InputJsonValue;
}

/**
 * Save TipTap JSON content to the StoryPage. Creates the StoryPage row on
 * first save (a product may exist without one until the maker starts editing).
 */
export async function saveStoryAction(
  productId: string,
  content: Record<string, unknown> | null,
  headline: string | null
): Promise<StudioActionState> {
  const input = await loadStoryInput(
    productId,
    content,
    headline,
    "You must be signed in to edit a story."
  );
  if (!input.ok) return { error: input.error };

  try {
    const db = getDb();
    await db.storyPage.upsert({
      where: { productId },
      create: {
        productId,
        headline: input.headline,
        bodyContent: toBodyContent(input.doc),
      },
      update: {
        headline: input.headline,
        bodyContent: toBodyContent(input.doc),
      },
    });
  } catch (error) {
    console.error(`saveStoryAction failed for product ${productId}:`, error);
    return { error: "Could not save the story. Please try again." };
  }

  return {};
}

/**
 * Save content AND set published state in one action. Used by the publish/
 * unpublish button so content and visibility stay in sync.
 */
export async function publishStoryAction(
  productId: string,
  content: Record<string, unknown> | null,
  headline: string | null,
  published: boolean
): Promise<StudioActionState> {
  const input = await loadStoryInput(
    productId,
    content,
    headline,
    "You must be signed in to publish a story."
  );
  if (!input.ok) return { error: input.error };

  try {
    const db = getDb();
    await db.storyPage.upsert({
      where: { productId },
      create: {
        productId,
        headline: input.headline,
        bodyContent: toBodyContent(input.doc),
        published,
      },
      update: {
        headline: input.headline,
        bodyContent: toBodyContent(input.doc),
        published,
      },
    });
  } catch (error) {
    console.error(`publishStoryAction failed for product ${productId}:`, error);
    return { error: "Could not update the story. Please try again." };
  }

  return {};
}
