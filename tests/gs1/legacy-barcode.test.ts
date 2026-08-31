/**
 * Legacy EAN-13 symbol (#9, brief §7: "the legacy barcode (EAN/UPC), derived
 * from the same GTIN").
 *
 * Structural tests prove the SVG is well-formed; the decode test proves the
 * printed mark round-trips through zxing — same standard as the 2D symbols.
 */
import { describe, expect, it, beforeAll } from "vitest";
import { Resvg } from "@resvg/resvg-js";
import { readBarcodesFromImageData } from "zxing-wasm/reader";
import { toGtin14 } from "@/lib/gs1/gtin";
import {
  deriveLegacyValue,
  renderLegacyBarcode,
  EAN_QUIET_LEFT_MODULES,
  EAN_QUIET_RIGHT_MODULES,
} from "@/lib/gs1/barcode";
import { warmBarcodeVerifier } from "@/lib/gs1/verify";
import { isDownloadEnabled } from "@/lib/gs1/download-gate";

beforeAll(async () => {
  process.env.NEXT_PUBLIC_RESOLVER_URL = "https://id.almsby.com";
  await warmBarcodeVerifier();
});

describe("deriveLegacyValue — GTIN-14 → EAN-13 derivation rules", () => {
  it("drops a zero indicator digit to EAN-13", () => {
    // GTIN-12/13-based GTIN-14s all start with 0.
    expect(deriveLegacyValue("04006381333931")).toBe("4006381333931");
    expect(deriveLegacyValue(toGtin14("4006381333931")!)).toBe(
      "4006381333931"
    );
  });

  it("prefers an explicitly stored legacy value when shape-valid", () => {
    expect(deriveLegacyValue("04006381333931", "036000291452")).toBe(
      "036000291452"
    );
  });

  it("ignores a malformed stored value and falls back to derivation", () => {
    expect(deriveLegacyValue("04006381333931", "abc")).toBe("4006381333931");
    expect(deriveLegacyValue("04006381333931", "123")).toBe("4006381333931");
  });

  it("returns null for non-zero indicator digits (no standard legacy mark)", () => {
    // 1–8 indicator ranges (variable measure, coupons…) — skip, never error.
    expect(deriveLegacyValue("10000000000119")).toBeNull();
    expect(deriveLegacyValue("28000000000154")).toBeNull();
  });
});

describe("renderLegacyBarcode — strict SVG structure", () => {
  const rendered = renderLegacyBarcode("04006381333931")!;

  it("renders an EAN-13 with the derived value", () => {
    expect(rendered.value).toBe("4006381333931");
  });

  it("is self-describing (intrinsic width/height, like the 2D symbols)", () => {
    // Measured bwip-js output for EAN-13 with OCR-B HRI: 95 symbol modules
    // + 11 + 7 quiet + 1 guard-bar extension column + text band (82) + the
    // 2-module HRI clearance (#47) = 125 wide, 84 tall.
    expect(rendered.svg).toMatch(/<svg[^>]+width="125"/);
    expect(rendered.svg).toMatch(/viewBox="0 0 125 84"/);
  });

  it("renders the Human Readable Interpretation in genuine OCR-B glyphs", () => {
    // 13 digits, each baked as a filled vector path by bwip-js — no font
    // dependency at render time, prints crisp at any scale.
    const glyphFills = rendered.svg.match(/fill="#000000"/g) ?? [];
    expect(glyphFills.length).toBe(13);
  });

  it("clears the HRI digits from the data bars (#47)", () => {
    // Every glyph path carries the downward translate; bar strokes do not.
    const translated = rendered.svg.match(
      /<path transform="translate\(0 2\)" d=/g
    );
    expect(translated?.length).toBe(13);
    // Bars (stroke paths) are untouched by the shift.
    expect(rendered.svg).toMatch(/<path stroke="#000000" stroke-width="1" d=/);
    expect(rendered.svg).not.toMatch(/<path stroke[^>]*transform=/);
  });

  it("bakes GS1 quiet zones into the SVG (>= symbol + 11X + 7X wide)", () => {
    const vb = rendered.svg.match(/viewBox="0 0 (\d+) (\d+)"/)!;
    const width = Number(vb[1]);
    expect(width).toBeGreaterThanOrEqual(
      95 + EAN_QUIET_LEFT_MODULES + EAN_QUIET_RIGHT_MODULES
    );
  });

  it("returns null (skip) when no legacy derivation exists", () => {
    expect(renderLegacyBarcode("10000000000119")).toBeNull();
  });
});

describe("legacy symbol DECODES (round-trip, same bar as §10.2)", () => {
  it("rasterized EAN-13 decodes back to the derived value via zxing", async () => {
    const rendered = renderLegacyBarcode("04006381333931")!;
    const rastered = new Resvg(rendered.svg, {
      fitTo: { mode: "width", value: 600 },
    }).render();
    const px = rastered.pixels;
    // Composite onto white (same pitfall the CI harness covers).
    for (let i = 0; i < px.length; i += 4) {
      const a = px[i + 3] / 255;
      px[i] = Math.round(px[i] * a + 255 * (1 - a));
      px[i + 1] = Math.round(px[i + 1] * a + 255 * (1 - a));
      px[i + 2] = Math.round(px[i + 2] * a + 255 * (1 - a));
      px[i + 3] = 255;
    }
    const results = await readBarcodesFromImageData(
      {
        data: new Uint8ClampedArray(px),
        width: rastered.width,
        height: rastered.height,
      } as unknown as ImageData,
      { tryHarder: true, formats: ["EAN13"] }
    );
    const digits = results
      .filter((r) => r.isValid)
      .map((r) => r.text.replace(/[^0-9]/g, ""));
    expect(digits.some((d) => d.includes("4006381333931"))).toBe(true);
  });
});

describe("download gate (brief §8 — fail-closed)", () => {
  it("is enabled only when verification passed AND the UI is hydrated", () => {
    expect(isDownloadEnabled(true, true)).toBe(true);
    expect(isDownloadEnabled(false, true)).toBe(false);
    expect(isDownloadEnabled(true, false)).toBe(false);
    expect(isDownloadEnabled(false, false)).toBe(false);
  });
});
