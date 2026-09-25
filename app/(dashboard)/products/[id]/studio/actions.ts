"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { optionalInput } from "@/lib/input";
import { getOwnedProduct } from "@/lib/products/queries";
import { findUnsafeHref } from "@/lib/story/markUtils";
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

  // Write-side link gate: an href the renderer's allowlist would reject (see
  // safeHref in markUtils) must never be persisted — refusing the save stops
  // bodyContent accumulating hostile values that every consumer render would
  // then have to keep neutralizing. The offending value is logged as evidence
  // (fail-loud); the maker gets a user-safe message. Benign missing or
  // malformed-but-harmless hrefs render as plain text and are NOT rejected.
  const unsafeHref = findUnsafeHref(doc);
  if (unsafeHref !== null) {
    console.error(
      `loadStoryInput: rejected story save for product ${productId} — unsafe link href: ${unsafeHref}`
    );
    return {
      ok: false,
      error:
        "The story contains a link with an address that is not allowed. Edit the link and try again.",
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
 * A "clear" save (doc === null) stores Prisma.DbNull — the explicit,
 * documented way to write SQL NULL for a nullable Json column — so the null
 * case no longer needs `as unknown` to satisfy generated types that exclude
 * plain JS `null`. (A runtime probe against local Postgres showed plain null
 * is ALSO accepted on update — failing only on record-not-found — so the
 * earlier "it must throw" assumption was wrong; DbNull removes reliance on
 * that coercion and states the intent. SQL NULL reads back as null through
 * normalizeTipTapContent on every load path.) The non-null cast remains only
 * because TipTapDoc's optional attrs don't structurally match Prisma's
 * index-signature Json input — the runtime values are plain JSON either way.
 */
function toBodyContent(
  doc: TipTapDoc | null
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  if (doc === null) return Prisma.DbNull;
  return doc as unknown as Prisma.InputJsonValue;
}

/**
 * Clear the consumer story page's cached entries after a SUCCESSFUL write.
 *
 * revalidatePath, not revalidateTag/updateTag: the public route does zero
 * tagged fetches (Prisma only), so a tag has no association on the route to
 * act on — the path form is documented to invalidate every path matching the
 * page file, including `revalidate = false` entries. Both route-group
 * spellings are passed because Next has matched the file path (groups
 * included) and the URL path in different versions; an unmatched form is a
 * no-op, so calling both guarantees the match. Cost: any story write clears
 * every story page's cache (they re-render on next visit) — accepted at this
 * scale over a missed unpublish.
 *
 * Called only AFTER the committed upsert: a failed write must never clear a
 * good cached page.
 *
 * VERIFIED (local ISR probe, NEXT_PRIVATE_DEBUG_CACHE=1): both spellings reach
 * the cache layer as tags `_N_T_/(public)/s/[gtin]/page` and `_N_T_/s/[gtin]/page`
 * (batched, no errors). NOTE: today the route renders DYNAMIC per request
 * (private/no-store, no cache events) — the revalidate=false contract above is
 * inert until the i18n static-rendering question is resolved — so these calls
 * are currently harmless no-ops that become load-bearing the moment the route
 * is served statically.
 */
function clearStoryPageCache(): void {
  revalidatePath("/(public)/s/[gtin]", "page");
  revalidatePath("/s/[gtin]", "page");
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

  clearStoryPageCache();
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

  // Headline required to publish (Phase 2 brief §5: "headline (short, required
  // to publish)"). Drafts may save without one; only the publish transition is
  // gated. English copy matches this file's raw-string action-error convention.
  if (!input.headline) {
    return { error: "A headline is required to publish a story." };
  }

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

  clearStoryPageCache();
  return {};
}
