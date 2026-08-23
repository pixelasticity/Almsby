"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { validateProductInput } from "@/lib/products/validate";

export type ProductFormState = { error?: string };

export async function createProductAction(
  _prev: ProductFormState | undefined,
  formData: FormData
): Promise<ProductFormState> {
  const result = validateProductInput({
    name: String(formData.get("name") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    netContent: String(formData.get("netContent") ?? ""),
    countryOfOrigin: String(formData.get("countryOfOrigin") ?? ""),
    materialComposition: String(formData.get("materialComposition") ?? ""),
    status: String(formData.get("status") ?? "draft"),
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
    const business = await db.business.findFirst({
      where: { ownerId: user.id },
    });
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