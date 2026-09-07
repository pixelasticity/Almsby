"use server";

import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getOwnedProduct } from "@/lib/products/queries";

export type StudioActionState = { error?: string };

/** Ownership-checked upsert of the product's StoryPage content. */
async function getOwnedStoryPage(productId: string, userId: string) {
  const product = await getOwnedProduct(productId, userId);
  if (!product) return null;
  const db = getDb();
  return db.storyPage.findUnique({ where: { productId } });
}

/**
 * Save TipTap JSON content to the StoryPage. Creates the StoryPage row on
 * first save (a product may exist without one until the maker starts editing).
 */
export async function saveStoryAction(
  productId: string,
  content: Record<string, unknown> | null
): Promise<StudioActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in to edit a story." };

  // Ownership gate.
  const owned = await getOwnedProduct(productId, user.id);
  if (!owned) return { error: "Product not found." };

  try {
    const db = getDb();
    await db.storyPage.upsert({
      where: { productId },
      create: { productId, bodyContent: content as unknown as Prisma.InputJsonValue },
      update: { bodyContent: content as unknown as Prisma.InputJsonValue },
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
  published: boolean
): Promise<StudioActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in to publish a story." };

  const owned = await getOwnedProduct(productId, user.id);
  if (!owned) return { error: "Product not found." };

  try {
    const db = getDb();
    await db.storyPage.upsert({
      where: { productId },
      create: { productId, bodyContent: content as unknown as Prisma.InputJsonValue, published },
      update: { bodyContent: content as unknown as Prisma.InputJsonValue, published },
    });
  } catch (error) {
    console.error(`publishStoryAction failed for product ${productId}:`, error);
    return { error: "Could not update the story. Please try again." };
  }

  return {};
}
