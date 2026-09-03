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

async function findOwnedProduct(productId: string, userId: string) {
  const db = getDb();
  return db.product.findFirst({
    where: { id: productId, business: { ownerId: userId } },
    // Narrow projection — only the fields the UI and title display.
    select: {
      name: true,
      brand: true,
      status: true,
      gtin: { select: { gtinValue: true } },
    },
  });
}

/**
 * The user's product with its GTIN value, or null when it doesn't exist or
 * belongs to someone else ("expected unknown", never an error).
 */
export const getOwnedProduct = cache(findOwnedProduct);
