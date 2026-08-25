"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { validateBusinessOnboarding } from "@/lib/products/business-onboarding";

export type BusinessOnboardingState = { error?: string };

export async function createBusinessAction(
  _prev: BusinessOnboardingState | undefined,
  formData: FormData
): Promise<BusinessOnboardingState> {
  const result = validateBusinessOnboarding({
    name: String(formData.get("name") ?? ""),
    industryCategory: String(formData.get("industryCategory") ?? ""),
    operatingCountry: String(formData.get("operatingCountry") ?? ""),
    currency: String(formData.get("currency") ?? ""),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to set up a business." };
  }

  try {
    const db = getDb();
    // Idempotent: re-submitting onboarding keeps the existing Business.
    const existing = await db.business.findFirst({ where: { ownerId: user.id } });
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
