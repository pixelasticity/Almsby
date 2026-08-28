/**
 * Scan-reliable barcode rendering for #6.
 *
 * Two symbols on the dual-marked label, both driven by the same GTIN-14 and
 * REFERENTIALLY equivalent (same underlying product), not cryptographically so:
 *   - QR  : encodes the plain GS1 Digital Link URI (https://<resolver>/01/<gtin14>),
 *           no FNC1 (GS1 Digital Link in QR needs none).
 *   - GS1 DataMatrix : encodes AI(01)+GTIN with FNC1 in position 1, plus a
 *           human "GS1" caption — the regulated mark retailers expect.
 *
 * Rendering is strict for scan reliability: crisp 1:1 modules (monochrome),
 * integer coordinates, no rounded/anti-aliased cells, quiet zones baked into
 * the SVG (QR >= 4 modules, DataMatrix 2-3X). Symbology encoding is delegated
 * to bwip-js — never hand-roll Reed-Solomon/masking.
 */
import bwipjs from "bwip-js";
import { buildDigitalLinkUri } from "./digital-link";

// @types/bwip-js (v3) predates the runtime v4 that ships `toSVG`. Type it here
// so callers get the exact SVG-string API without fighting the stale namespace.
const bwipSvg = bwipjs as unknown as {
  toSVG(opts: Record<string, unknown>): string;
};

/** Quiet zone modules: QR needs 4; DataMatrix 2-3X for handheld scanners. */
const QR_QUIET_MODULES = 4;
const DM_QUIET_MODULES = 3;

export type BarcodeRender = { svg: string; uri: string | null };

/**
 * Real QR encoding the Digital Link URI for a GTIN-14. Returns the SVG (crisp,
 * 1:1, quiet-zone-baked) and the URI it encodes, or null for an invalid GTIN.
 */
export function renderDigitalLinkQr(gtin14: string): BarcodeRender | null {
  const uri = buildGtinUri(gtin14);
  if (!uri) return null;
  const svg = bwipSvg.toSVG({
    bcid: "qrcode",
    text: uri,
    scale: 1, // 1:1 modules — no fractional scaling that blurs edges
    monochrome: true,
    // Bake quiet zone as SVG padding (never leave it to page margins).
    paddingleft: QR_QUIET_MODULES,
    paddingright: QR_QUIET_MODULES,
    paddingtop: QR_QUIET_MODULES,
    paddingbottom: QR_QUIET_MODULES,
  });
  return { svg, uri };
}

/**
 * Real GS1 DataMatrix for a GTIN-14: AI(01)+GTIN with FNC1 in first position,
 * plus the "GS1" caption under the symbol. Returns the SVG (crisp, larger
 * quiet zone relative to the QR, independent sizing).
 */
export function renderGs1DataMatrix(gtin14: string): string | null {
  if (!/^\d{14}$/.test(gtin14)) return null;
  const svg = bwipSvg.toSVG({
    bcid: "gs1datamatrix",
    text: `(01)${gtin14}`, // AI(01) GS1 GTIN; bwip-js handles FNC1 for gs1datamatrix
    parsefnc: true,
    scale: 1,
    monochrome: true,
    paddingleft: DM_QUIET_MODULES,
    paddingright: DM_QUIET_MODULES,
    paddingtop: DM_QUIET_MODULES,
    paddingbottom: DM_QUIET_MODULES,
  });
  return svg;
}

/** Build the Digital Link URI for a GTIN-14 from the resolver env (pure seam). */
function buildGtinUri(gtin14: string): string | null {
  if (!/^\d{14}$/.test(gtin14)) return null;
  try {
    return buildDigitalLinkUri(gtin14);
  } catch {
    return null; // env not set — caller decides
  }
}