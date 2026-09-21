/**
 * Shared ownership-scoped data access for maker-dashboard features.
 *
 * Every lookup is keyed by the signed-in user id, so callers can never read
 * another business's rows. Wrappers are cache()-wrapped so multiple callers
 * within one request (page render + generateMetadata) share a single query.
 */
import { cache } from "react";
import { getDb } from "@/lib/db";

/** The signed-in user's Business, or null while onboarding is pending. */
export const getOwnedBusiness = cache(async (userId: string) => {
  const db = getDb();
  return db.business.findFirst({ where: { ownerId: userId } });
});

/** What the sidebar's "Recent Products" rows actually render. */
export type RecentProduct = { id: string; name: string };

/**
 * The user's most-recently created products for the sidebar's "Recent
 * Products" section. Ownership-scoped to the caller's business, so another
 * business's id yields an empty array. Narrow projection (id, name) — only
 * what the sidebar needs.
 *
 * The default limit of 4 is sized so the section fits the sidebar's vertical
 * budget on shorter viewports — it is a layout choice, not a data limit.
 * Covered by tests/queries.test.ts.
 */
export const getRecentProducts = cache(
  async (userId: string, limit = 4): Promise<RecentProduct[]> => {
    const db = getDb();
    return db.product.findMany({
      where: { business: { ownerId: userId } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, name: true },
    });
  }
);

async function findOwnedProduct(productId: string, userId: string) {
  const db = getDb();
  return db.product.findFirst({
    where: { id: productId, business: { ownerId: userId } },
    // Narrow projection — only the fields the UI and title display.
    // storyPage.published is included so the detail page can render the
    // story-entry status without a second sequential DB round-trip (the
    // product detail page used to fire this as its own findUnique).
    select: {
      name: true,
      brand: true,
      status: true,
      gtin: { select: { gtinValue: true } },
      storyPage: { select: { published: true } },
    },
  });
}

/**
 * The user's product with its GTIN value, or null when it doesn't exist or
 * belongs to someone else ("expected unknown", never an error).
 */
export const getOwnedProduct = cache(findOwnedProduct);
