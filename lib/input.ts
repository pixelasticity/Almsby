/**
 * Shared pure helpers for form-input normalization.
 * Kept free of DB/auth so every validator (lib/products/*, business
 * onboarding) reuses the same trim/collapse semantics in prod and in tests.
 */

/** Trim; null/undefined collapse to "". */
export function cleanInput(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

/** Trim; empty strings collapse to null (for optional DB columns). */
export function optionalInput(value: string | null | undefined): string | null {
  const v = cleanInput(value);
  return v.length > 0 ? v : null;
}
