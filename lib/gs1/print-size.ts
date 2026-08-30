/**
 * Print-size math for downloadable labels (#9, brief §7).
 *
 * Pure and unit-testable: every consumer-facing size decision flows through
 * here so the GS1 X-dimension floor is enforced IN CODE, not as UI guidance —
 * a maker must not be able to download or print a symbol whose X-dimension
 * (module width) falls below the scannability floor.
 *
 * All SVGs are rendered at bwip-js scale 1, so one SVG unit === one module,
 * and the viewBox width/height (with quiet zones baked in) is measured in
 * modules.
 */

/** Scan-protocol floor: X-dimension >= 0.35mm at print. */
export const MIN_X_DIMENSION_MM = 0.35;

/** PNG export DPI — 600 is a common label-printer-respectable resolution. */
export const PNG_DPI = 600;

export type XDimensionPreset = { id: string; mm: number };

/** Fixed preset choices — no free-form size control without a floor (§7). */
export const X_DIMENSION_PRESETS: XDimensionPreset[] = [
  { id: "compact", mm: 0.35 }, // the floor itself
  { id: "standard", mm: 0.5 },
  { id: "large", mm: 0.65 },
];

export type SymbolGeometry = {
  /** SVG viewBox width in modules (quiet zones included). */
  viewBoxWidth: number;
  /** SVG viewBox height in modules (quiet zones included). */
  viewBoxHeight: number;
  quietLeft: number;
  quietRight: number;
};

/** Symbol module count excluding quiet zones — what X-dimension measures.
 *  NOTE (measured against real bwip-js output): EAN-13's viewBox carries one
 *  extra column beyond symbol + quiet zones (guard-bar extension). Counting
 *  it as a symbol module makes the computed width slightly LARGER than the
 *  true symbol — i.e. the printed X-dimension is >= the computed one. The
 *  error is in the safe direction: we never undershoot the floor. */
export function symbolModuleCount(g: SymbolGeometry): number {
  return g.viewBoxWidth - g.quietLeft - g.quietRight;
}

/** Physical symbol width in mm for an X-dimension (quiet zones excluded). */
export function physicalWidthMm(xMm: number, modules: number): number {
  return xMm * modules;
}

/**
 * Parse `viewBox="0 0 W H"` from a bwip-js SVG (units = modules at scale 1).
 * Returns null for a malformed SVG — callers skip, never guess.
 */
export function parseViewBox(svg: string): { w: number; h: number } | null {
  const m = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  if (!m) return null;
  return { w: Number(m[1]), h: Number(m[2]) };
}

/**
 * Raster scale (integer px/module) for a PNG at the given DPI that ACHIEVES
 * at least the requested X-dimension. Rounding down could silently undershoot
 * the floor (e.g. 0.35mm @600dpi = 8.27px), so we round UP and report the
 * achieved X-dimension — the artifact is always at least as large as asked.
 */
export function pngScaleForX(
  xMm: number,
  dpi: number = PNG_DPI
): { scale: number; achievedXMm: number } {
  const raw = (xMm * dpi) / 25.4;
  // Float dust guard: 0.508mm @600dpi computes as 12.000000000000002 and a
  // bare ceil() would jump to 13. Subtract an epsilon well below any real
  // size difference so exact values stay exact — genuine undershoots still
  // round up.
  const EPSILON = 1e-9;
  const scale = Math.max(1, Math.ceil(raw - EPSILON));
  return { scale, achievedXMm: (scale * 25.4) / dpi };
}

/** Label layout: symbols side by side at a shared X-dimension. */
export type LabelLayout = {
  /** Total label width in mm including gaps and outer margin. */
  widthMm: number;
  /** Total label height in mm (tallest symbol + caption/margin allowance). */
  heightMm: number;
  items: { widthMm: number; heightMm: number }[];
};

const LABEL_GAP_MM = 6;
const LABEL_MARGIN_MM = 6;
/** Allowance for the product-name line + symbol captions under a symbol. */
const LABEL_TEXT_MM = 14;

export function labelLayout(
  xMm: number,
  geometries: SymbolGeometry[],
  textAllowanceMm: number = LABEL_TEXT_MM
): LabelLayout {
  const items = geometries.map((g) => {
    const modules = symbolModuleCount(g);
    return {
      widthMm: physicalWidthMm(xMm, modules),
      heightMm: xMm * g.viewBoxHeight, // full SVG height incl. vertical quiet zone
    };
  });
  const symbolsWidth =
    items.reduce((sum, it) => sum + it.widthMm, 0) +
    LABEL_GAP_MM * Math.max(0, items.length - 1);
  const tallest = Math.max(0, ...items.map((it) => it.heightMm));
  return {
    widthMm: symbolsWidth + LABEL_MARGIN_MM * 2,
    heightMm: tallest + textAllowanceMm + LABEL_MARGIN_MM * 2,
    items,
  };
}
