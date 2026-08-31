"use client";

import { useMemo } from "react";
import {
  renderDigitalLinkQr,
  renderGs1DataMatrix,
  renderLegacyBarcode,
  type BarcodeRender,
  type LegacyBarcodeRender,
} from "@/lib/gs1/barcode";

export type BarcodeRenders = {
  qr: BarcodeRender | null;
  dm: string | null;
  legacy: LegacyBarcodeRender | null;
};

/** Stable empty state so a disabled render never allocates or re-renders. */
const EMPTY_RENDERS: BarcodeRenders = { qr: null, dm: null, legacy: null };

/**
 * Memoized per-GTIN render set for the dual-mark label.
 *
 * Single source of truth for the "render all three symbols for a GTIN" memo:
 * DualMarkLabel (display) and LabelDownloads (download actions) both render
 * the same three bwip-js symbols. `enabled` lets the display component gate
 * its work on client hydration (see useHydrated) while the downloads panel
 * always renders — matching each component's previous behavior exactly.
 *
 * NOTE: this only renders the SVG strings. It never calls the
 * decode-verification harness (lib/gs1/verify.ts) — that stays server-side,
 * exactly once per label page in app/(dashboard)/products/[id]/label/page.tsx.
 *
 * SCOPE NOTE: this hook deduplicates the render MEMO across components, not
 * the render COUNT. DualMarkLabel (display) and LabelDownloads (downloads)
 * are separate React instances, so the label page still computes the three
 * symbols twice (6 renders). Halving that (6→3) requires lifting the renders
 * into a shared client parent that passes results to both children — a
 * page-level restructure, deferred. Tracked in guidelines/technical-debt.md;
 * revisit only if label-page CPU shows up in profiling (server-side decode
 * verification dominates this page today, ~1s).
 */
export function useBarcodeRenders(
  gtin14: string,
  enabled: boolean
): BarcodeRenders {
  return useMemo(() => {
    if (!enabled) return EMPTY_RENDERS;
    return {
      qr: renderDigitalLinkQr(gtin14),
      dm: renderGs1DataMatrix(gtin14),
      legacy: renderLegacyBarcode(gtin14),
    };
  }, [gtin14, enabled]);
}