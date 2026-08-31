"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getOwnedBusiness } from "@/lib/products/queries";
import { validateProductInput } from "@/lib/products/validate";
import { coerceFormString } from "@/lib/input";

export type ProductFormState = { error?: string };

export async function createProductAction(
  _prev: ProductFormState | undefined,
  formData: FormData
): Promise<ProductFormState> {
  const result = validateProductInput({
    name: coerceFormString(formData, "name"),
    brand: coerceFormString(formData, "brand"),
    netContent: coerceFormString(formData, "netContent"),
    countryOfOrigin: coerceFormString(formData, "countryOfOrigin"),
    materialComposition: coerceFormString(formData, "materialComposition"),
    status: coerceFormString(formData, "status") || "draft",
  });

  if (!result.ok) {
    return { error: result.error };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to create a product." };
  }

  try {
    const db = getDb();
    const business = await getOwnedBusiness(user.id);
    if (!business) {
      return {
        error:
          "No Business found for your account. Re-verify your email and sign in again.",
      };
    }
    await db.product.create({
      data: { businessId: business.id, ...result.data },
    });
  } catch (error) {
    console.error("createProductAction failed:", user.id, error);
    return { error: "Could not save the product. Please try again." };
  }

  redirect("/products");
}