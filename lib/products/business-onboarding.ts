/**
 * Pure, testable validation for the Phase 1 business-onboarding wizard.
 * Kept free of DB/auth (like lib/products/validate, lib/gs1/*).
 */

export type BusinessOnboardingInput = {
  name: string;
  industryCategory: string;
  operatingCountry: string;
  currency: string;
};

export type NormalizedBusinessOnboardingInput = {
  name: string;
  industryCategory: string | null;
  operatingCountry: string | null;
  currency: string | null;
};

export type OnboardingValidation =
  | { ok: true; data: NormalizedBusinessOnboardingInput }
  | { ok: false; error: string };

const clean = (value: string | null | undefined): string =>
  value?.trim() ?? "";

const optional = (value: string | null | undefined): string | null => {
  const v = clean(value);
  return v.length > 0 ? v : null;
};

/** Validate + normalize the onboarding form across its 3 steps. */
export function validateBusinessOnboarding(
  input: BusinessOnboardingInput
): OnboardingValidation {
  const name = clean(input.name);
  if (!name) {
    return { ok: false, error: "Enter a business name to continue." };
  }
  if (name.length < 2) {
    return { ok: false, error: "Business names must be at least 2 characters long." };
  }

  const category = optional(input.industryCategory);
  if (!category) {
    return {
      ok: false,
      error: "Select an industry category to customize your workspace tools.",
    };
  }

  const country = optional(input.operatingCountry);
  if (!country) {
    return { ok: false, error: "Select your primary operating country." };
  }
  const currencyValue = optional(input.currency);
  if (!currencyValue) {
    return { ok: false, error: "Select a default currency for pricing and payouts." };
  }

  return {
    ok: true,
    data: {
      name,
      industryCategory: category,
      operatingCountry: country,
      currency: currencyValue,
    },
  };
}