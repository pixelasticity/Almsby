"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getOwnedBusiness } from "@/lib/products/queries";
import { validateBusinessOnboarding } from "@/lib/products/business-onboarding";
import { coerceFormString } from "@/lib/input";

export type BusinessOnboardingState = { error?: string };

export async function createBusinessAction(
  _prev: BusinessOnboardingState | undefined,
  formData: FormData
): Promise<BusinessOnboardingState> {
  const result = validateBusinessOnboarding({
    name: coerceFormString(formData, "name"),
    industryCategory: coerceFormString(formData, "industryCategory"),
    operatingCountry: coerceFormString(formData, "operatingCountry"),
    currency: coerceFormString(formData, "currency"),
  });

  if (!result.ok) {
    return { error: result.error };
  }

    // Auth guard: an expired session redirects to /sign-in mid-submit (#83).
  const user = await requireAuth();

  try {
    const db = getDb();
    // Idempotent: re-submitting onboarding keeps the existing Business.
    const existing = await getOwnedBusiness(user.id);
    if (!existing) {
      await db.business.create({
        data: {
          ownerId: user.id,
          name: result.data.name,
          industryCategory: result.data.industryCategory,
          operatingCountry: result.data.operatingCountry,
          currency: result.data.currency,
        },
      });
    }
  } catch (error) {
    console.error("createBusinessAction failed:", user.id, error);
    return { error: "Could not set up your business. Please try again." };
  }

  // Redirect after the try/catch so NEXT_REDIRECT isn't swallowed.
  redirect("/dashboard");
}
