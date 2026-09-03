/**
 * GTIN utilities (GS1).
 *
 * Phase 1: normalization to GTIN‑14 and GS1 check‑digit validation.
 *
 * Note on scope: GS1 *source* tracking (`own_prefix` | `almsby_assisted`)
 * lives on the GTIN Prisma model (see prisma/schema.prisma) and is decided
 * by the import / concierge flow — not by these pure helpers.
 */

const GTIN_PATTERN = /^(?:\d{8}|\d{12,14})$/;

/** Accepts broadly well-formed GTINs: 8 (GTIN‑8) or 12–14 digits (GTIN‑12/13/14). */
export function isValidGtinFormat(value: string): boolean {
  return GTIN_PATTERN.test(value.trim());
}

/** Normalize a well-formed GTIN‑8/12/13/14 to a 14‑digit GTIN‑14 (left‑padded). */
export function toGtin14(value: string): string | null {
  const v = value.trim();
  if (!GTIN_PATTERN.test(v)) return null;
  return v.padStart(14, "0");
}

/**
 * Standard GS1 modulo‑10 check‑digit validation for a 14‑digit GTIN.
 * Weights the first 13 digits left→right as 3, 1, 3, 1, …
 */
export function hasValidCheckDigit(gtin14: string): boolean {
  if (!/^\d{14}$/.test(gtin14)) return false;
  const sum = gtin14
    .slice(0, 13)
    .split("")
    .reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 3 : 1), 0);
  const check = (10 - (sum % 10)) % 10;
  return check === Number(gtin14[13]);
}

/**
 * Full GTIN validation: well‑formed structure + valid GS1 check digit.
 * An all‑zero value ("00000000000000") is rejected outright — it satisfies
 * the check‑digit math but is never a real product identifier.
 */
export function isValidGtin(value: string): boolean {
  const v = value.trim();
  if (v.length === 0 || /^0+$/.test(v)) return false;
  const gtin14 = toGtin14(v);
  return gtin14 !== null && hasValidCheckDigit(gtin14);
}

/**
 * Classify a raw GTIN input into one of four states for inline validation UI:
 *   - "valid"       → well-formed + passes the GS1 check digit; a real identifier.
 *   - "checkDigit"  → correct structure but fails the GS1 modulo-10 check.
 *   - "length"      → 8/12–14 digit rules violated (too short, or wrong length).
 *   - "invalid"     → not a plausible GTIN at all: empty, non-numeric, or all-zero.
 *
 * Guaranteed to classify every input (no fall-through). Non-numeric AND all-zero
 * both land in `invalid` (both are "not a real product identifier"), matching the
 * Phase 1 brief §4 required batch. Exported as a pure helper so tests pin the map.
 */
export type GtinClass = "valid" | "checkDigit" | "length" | "invalid";

export function classifyGtinError(value: string): GtinClass {
  const v = value.trim();
  if (v.length === 0 || /\D/.test(v)) return "invalid";
  if (/^0+$/.test(v)) return "invalid";
  if (!/^(?:\d{8}|\d{12,14})$/.test(v)) return "length";
  const gtin14 = v.padStart(14, "0");
  return hasValidCheckDigit(gtin14) ? "valid" : "checkDigit";
}
