/**
 * GS1 sequential GTIN allocation under a company prefix (concierge flow, #4).
 *
 * A GS1 Company Prefix is issued at a variable length (typically 6–10 digits
 * including the indicator digit). The number of digits left for the item
 * reference is `13 - prefixLength` (GTIN-14 leaves the last digit for the check
 * digit). GS1 allocation must NEVER reuse an item reference — even after a
 * product is deleted/archived — which is why the `Business` keeps a monotonic
 * `gtinSequenceLastUsed` counter instead of deriving "next" from existing rows.
 */
import { hasValidCheckDigit } from "./gtin";

/** Prefixes shorter than this leave no room for an item reference. */
const MIN_PREFIX_LEN = 1;
/** Longest plausible GS1 company prefix (leaves at least 1 item-ref digit in 13). */
const MAX_PREFIX_LEN = 12;

export type PrefixError =
  | { ok: false; code: "empty" }
  | { ok: false; code: "nonNumeric" }
  | { ok: false; code: "tooShort" }
  | { ok: false; code: "tooLong" };

export function validatePrefix(input: string): { ok: true } | PrefixError {
  const v = input.trim();
  if (!v) return { ok: false, code: "empty" };
  if (!/^\d+$/.test(v)) return { ok: false, code: "nonNumeric" };
  if (v.length < MIN_PREFIX_LEN) return { ok: false, code: "tooShort" };
  if (v.length > MAX_PREFIX_LEN) return { ok: false, code: "tooLong" };
  return { ok: true };
}

/**
 * Compose a GTIN-14 from a company prefix + zero-padded item reference,
 * computing the GS1 check digit. Returns null if the prefix leaves no room
 * for an item reference (or the item ref overflows its width).
 */
export function composeGtin14(prefix: string, itemRef: number): string | null {
  const itemWidth = 13 - prefix.length;
  if (itemWidth < 1) return null;
  const maxItem = Math.pow(10, itemWidth) - 1;
  if (itemRef < 0 || itemRef > maxItem) return null;
  const body = prefix + String(itemRef).padStart(itemWidth, "0");
  // hasValidCheckDigit expects a 14-digit string; the body here is 13 digits,
  // so compute the check digit directly using the GS1 3/1 weighting.
  const sum = body
    .split("")
    .reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 3 : 1), 0);
  const check = (10 - (sum % 10)) % 10;
  return body + String(check);
}

/**
 * Next sequential GTIN under a prefix, given the last-used item reference.
 * The caller is responsible for a bounded P2002 retry loop (this is pure math).
 */
export function nextSequentialGtin(
  prefix: string,
  lastUsed: number
): string | null {
  return composeGtin14(prefix, lastUsed + 1);
}

// Re-export the check-digit helper so the allocator's generated numbers are
// validated with the same GS1 logic used on import (defense in depth).
export { hasValidCheckDigit };