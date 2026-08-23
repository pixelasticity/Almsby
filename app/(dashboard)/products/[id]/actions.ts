"use server";

import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { classifyGtinError, toGtin14 } from "@/lib/gs1/gtin";

export type GtinImportState = {
  error?: string;
  gtin?: string;
  // Class is returned so the client can show the exact inline warning.
  cls?: "checkDigit" | "length" | "invalid" | "valid";
};

/**
 * Import a GTIN for a product owned by the signed-in user's Business.
 *
 * Validates + normalizes to GTIN-14, then upserts a single GTIN row
 * (Product.gtin is 1:1, idempotent re-entry is allowed). Source is always
 * `own_prefix` here — the maker is importing an existing prefix (see #10 for
 * the concierge/almsby_assisted source path).
 *
 * Barcode / digital-link / story rendering are explicitly OUT of scope (#6/#7/#9)
 * — this only persists the identifier.
 */
export async function importGtinAction(
  _prev: GtinImportState | undefined,
  formData: FormData
): Promise<GtinImportState> {
  const productId = String(formData.get("productId") ?? "");
  const raw = String(formData.get("gtin") ?? "").trim();

  if (!productId) {
    return { error: "missingProduct" };
  }

  const cls = classifyGtinError(raw);
  if (cls !== "valid") {
    // The client maps `cls` to the exact §4 inline copy (see GtinImportForm).
    return { cls };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "authRequired" };
  }

  const gtin14 = toGtin14(raw);
  if (!gtin14) {
    return { error: "Invalid entry: Please enter a valid, published GS1 GTIN." };
  }

  try {
    const db = getDb();
    // Ownership guard: the product must belong to the signed-in user's Business.
    const product = await db.product.findFirst({
      where: { id: productId, business: { ownerId: user.id } },
    });
    if (!product) {
      return { error: "productNotFound" };
    }

    await db.gTIN.upsert({
      where: { productId },
      create: {
        productId,
        gtinValue: gtin14,
        source: "own_prefix",
      },
      update: { gtinValue: gtin14, source: "own_prefix" },
    });

    return { gtin: gtin14, cls: "valid" };
  } catch (error) {
    console.error("importGtinAction failed:", user.id, productId, error);
    return { error: "saveFailed" };
  }
}