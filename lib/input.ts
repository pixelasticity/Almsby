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

/**
 * Pragmatic email shape check: something@something.tld with no whitespace.
 * Shared by auth sign-up and the waitlist form so both stay in sync.
 * (Real deliverability is proven by the confirmation email, not a regex.)
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Read a text field from FormData as a string. FormData values can be File
 * objects when a payload is malformed or hostile; `String(file)` would
 * silently produce "[object File]" — so File values collapse to "" instead of
 * persisting garbage into DB columns.
 */
export function coerceFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

