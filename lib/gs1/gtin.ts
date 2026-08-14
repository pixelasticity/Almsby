/**
 * GTIN utilities.
 *
 * Phase 0: format stub only — full check-digit validation and the
 * concierge/import flows land in Phase 1. Nothing here may be used to
 * persist or generate barcode data yet (Phase 0 guardrails).
 */

/** Accepts broadly well-formed GTINs: 8 (GTIN-8) or 12-14 digits (GTIN-12/13/14). */
export function isValidGtinFormat(value: string): boolean {
  return /^(?:\d{8}|\d{12,14})$/.test(value.trim());
}