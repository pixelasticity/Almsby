/**
 * Data access for the public story page / the maker's story-page CMS.
 *
 * The public route (/s/[gtin]) is the page a scanned barcode opens, so it
 * must render without an authenticated session. This module therefore does
 * NOT go through the ownership-scoped helpers in lib/products/queries — it is
 * deliberately public. Maker-side writes (CMS save, publish) re-confirm
 * ownership at the action boundary via getOwnedProduct.
 *
 * Not cache()-wrapped on purpose: the ISR revalidate=false strategy built for
 * #71..#74 caches at the route level, so a second layer of request-level React
 * cache would only add confusion and stale reads.
 */
import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";

/** Shape stored in StoryPage.bodyContent — a small array of structured blocks. */
export type StoryBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string };

export type StoryPageInclude = Prisma.ProductGetPayload<{
  include: { storyPage: true; gtin: true };
}>;

/** Minimal structural seam so tests stub only findFirst (see tests/story). */
export type ProductStoryDb = {
  product: {
    findFirst: (args: {
      where: Record<string, unknown>;
      include: Record<string, unknown>;
    }) => Promise<StoryPageInclude | null>;
  };
};

/**
 * The product linked to a GTIN value, with its story page and its GTIN row.
 * Used by the public story page (Product data + StoryPage content + gtinValue
 * for JSON-LD) in a single round-trip.
 *
 * Returns null when no product has this GTIN — an "expected unknown" for the
 * route to 404 on, never an error. Domain-agnostic by construction: the lookup
 * is by GTIN VALUE only, the same discipline as the resolver route.
 *
 * The optional db arg defaults to the app connection; tests pass a stub so the
 * join shape can be asserted without a live database (same seam as GtinLookupDb).
 */
export async function getProductWithStoryByGtin(
  gtin14: string,
  db?: ProductStoryDb
): Promise<StoryPageInclude | null> {
  const client = db ?? getDb();
  return client.product.findFirst({
    where: { gtin: { gtinValue: gtin14 } },
    include: { storyPage: true, gtin: true },
  });
}