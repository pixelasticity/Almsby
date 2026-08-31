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
import { OCRB_TTF_BASE64 } from "./ocrb-font";

/**
 * Register the embedded OCR-B with bwip-js exactly once (idempotent — the
 * font compiler is a global registry; re-registering is wasteful, and the
 * renderers may run in multiple contexts).
 */
let ocrbRegistered = false;
function ensureOcrbFont(): void {
  if (ocrbRegistered) return;
  const bytes = Uint8Array.from(atob(
    OCRB_TTF_BASE64
  ), (c) => c.charCodeAt(0));
  // bwip-js v4: loadFont(name, [multY,] multX, data) — 100 = size multiplier;
  // actual glyph size is controlled per-render via the textsize option.
  bwipjs.loadFont("OCR-B", 100, bytes);
  ocrbRegistered = true;
}

// @types/bwip-js (v3) predates the runtime v4 that ships `toSVG`. Type it here
// so callers get the exact SVG-string API without fighting the stale namespace.
const bwipSvg = bwipjs as unknown as {
  toSVG(opts: Record<string, unknown>): string;
};

/** Quiet zone modules: QR needs 4; DataMatrix 2-3X; EAN-13 left 11 / right 7. */
export const QR_QUIET_MODULES = 4;
export const DM_QUIET_MODULES = 3;
export const EAN_QUIET_LEFT_MODULES = 11; // GS1 EAN-13: 11X left, 7X right
export const EAN_QUIET_RIGHT_MODULES = 7;

/**
 * bwip-js emits only a viewBox — no width/height attributes — so the SVG has
 * no intrinsic size and collapses to 0x0 under CSS auto sizing (flex content
 * sizing is circular without an intrinsic dimension). Copy the viewBox
 * dimensions onto the root tag so the artifact is self-describing; display
 * scaling stays in CSS and print sizing (X-dimension x modules) lands in #9.
 */
function withIntrinsicSize(svg: string): string {
  const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  if (!m) return svg;
  return svg.replace("<svg", `<svg width="${m[1]}" height="${m[2]}"`);
}

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
  return { svg: withIntrinsicSize(svg), uri };
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
  return withIntrinsicSize(svg);
}

/**
 * Derive the legacy EAN-13 value from a GTIN-14, per brief §7 ("the legacy
 * barcode, EAN/UPC, derived from the same GTIN").
 *
 * Rules (check-digit invariant under leading-zero removal — GS1 weighting
 * attaches from the right, so dropping indicator zeros never changes the
 * check digit):
 *   - "0" + 13 digits → EAN-13 (the 13 digits after the indicator). A stored
 *     UPC-A shows up as EAN-13 with a leading 0 — the same mark, valid at
 *     every retail POS.
 *   - Any other indicator digit (1–8: variable-measure, restricted, coupon
 *     ranges) has no standard legacy retail symbol → null (skip gracefully,
 *     never error).
 * An explicitly stored legacy value wins when present and shape-valid.
 */
export function deriveLegacyValue(
  gtin14: string,
  stored?: string | null
): string | null {
  if (stored && /^\d{12,13}$/.test(stored)) return stored;
  if (/^0\d{13}$/.test(gtin14)) return gtin14.slice(1);
  return null;
}

/** Vertical clearance (modules) between the data bars' bottoms and the HRI
 *  digit tops (#47). bwip-js places the glyphs flush against the bars; GS1-
 *  style EAN-13 printing keeps a small visible gap. ≈0.7mm at X = 0.35mm. */
const HRI_CLEARANCE_MODULES = 2;

/**
 * Shift the HRI glyph paths (bwip-js emits them as fill paths, distinct from
 * the stroked bars) down by HRI_CLEARANCE_MODULES and extend the viewBox to
 * match (#47). Measured motivation: bwip-js places the glyph tops exactly at
 * the data-bar bottom row — zero clearance. The `textyoffset` option moves
 * text the wrong way (up, into the bars), so the transform is applied here,
 * deterministically. Only fill paths are translated; bar strokes stay put.
 */
function withHriClearance(svg: string): string {
  const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  if (!m) return svg;
  const taller = svg
    .replace(/<path d=/g, `<path transform="translate(0 ${HRI_CLEARANCE_MODULES})" d=`)
    .replace(/viewBox="0 0 (\d+) (\d+)"/, `viewBox="0 0 ${m[1]} ${Number(m[2]) + HRI_CLEARANCE_MODULES}"`);
  return taller;
}

export type LegacyBarcodeRender = { svg: string; value: string };

/**
 * The legacy linear mark (EAN-13) for a GTIN-14 — brief §7's dual-marking
 * partner for the 2D symbols. Returns null when the GTIN has no legacy
 * derivation (non-zero indicator digit) so callers skip the slot silently.
 */
export function renderLegacyBarcode(
  gtin14: string,
  stored?: string | null
): LegacyBarcodeRender | null {
  const value = deriveLegacyValue(gtin14, stored);
  if (!value) return null;
  try {
    // Genuine OCR-B for the Human Readable Interpretation (brief §7 / GS1
    // spec: EAN-13 digits under the bars). Embedded via ocrb-font so every
    // render context (screen, SVG download, PNG, print PDF) shows identical,
    // license-clean glyphs.
    ensureOcrbFont();
    const svg = bwipSvg.toSVG({
      bcid: "ean13",
      text: value, // 13 digits incl. check digit — bwip-js validates it
      scale: 1,
      monochrome: true,
      // EAN-13 quiet zones are left/right only (GS1 General Specifications).
      paddingleft: EAN_QUIET_LEFT_MODULES,
      paddingright: EAN_QUIET_RIGHT_MODULES,
      // Human Readable Interpretation: digits under the bars in real OCR-B.
      includetext: true,
      font: "OCR-B",
      textsize: 10,
    });
    return { svg: withIntrinsicSize(withHriClearance(svg)), value };
  } catch (error) {
    // Same discipline as buildGtinUri: never a silent "no barcode".
    console.error(
      `[barcode] Failed to render the legacy EAN-13 for ${gtin14}:`,
      error
    );
    return null;
  }
}

/** Build the Digital Link URI for a GTIN-14 from the resolver env (pure seam). */
function buildGtinUri(gtin14: string): string | null {
  if (!/^\d{14}$/.test(gtin14)) return null;
  try {
    return buildDigitalLinkUri(gtin14);
  } catch (error) {
    // Never silent: a swallowed failure here means a maker sees "no barcode"
    // with zero indication why, and support has no error to work from.
    // Fail-closed, never silently wrong.
    console.error(
      `[barcode] Failed to build the Digital Link URI for ${gtin14}:`,
      error,
    );
    return null;
  }
}