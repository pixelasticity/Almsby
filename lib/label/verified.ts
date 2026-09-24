/**
 * Shared label-verification folding, kept OUTSIDE lib/gs1/* on purpose: the
 * HIGH-RISK zone owns how verification RUNS (lib/gs1/verify — the barcode
 * correctness gate), while this decides only what a MAKER-facing page prints
 * from an already-computed result. It never alters verification semantics —
 * and it FAILS CLOSED on a missing result.
 */
export type VerifiableResult = {
  qr: { ok: boolean };
  dm: { ok: boolean };
  legacy: { ok: boolean };
};

/** All three symbols decoded — or false for null/undefined (fail closed). */
export function isLabelVerified(
  result: VerifiableResult | null | undefined
): boolean {
  return result != null && result.qr.ok && result.dm.ok && result.legacy.ok;
}
