/**
 * Print-size math for #9 — the X-dimension floor is a code-enforced
 * invariant, so these tests ARE the enforcement spec.
 */
import { describe, expect, it } from "vitest";
import {
  MIN_X_DIMENSION_MM,
  X_DIMENSION_PRESETS,
  parseViewBox,
  physicalWidthMm,
  pngScaleForX,
  symbolModuleCount,
  labelLayout,
  PNG_DPI,
  type SymbolGeometry,
} from "@/lib/gs1/print-size";

const QR_GEOM: SymbolGeometry = {
  viewBoxWidth: 61, // 45 modules + 8 quiet (typical v3-ish)
  viewBoxHeight: 61,
  quietLeft: 8,
  quietRight: 8,
};

const EAN_GEOM: SymbolGeometry = {
  viewBoxWidth: 113, // 95 modules + 11 + 7 quiet
  viewBoxHeight: 77,
  quietLeft: 11,
  quietRight: 7,
};

describe("X-dimension floor (brief §7 — hard minimum in code)", () => {
  it("no preset may offer a size below the floor", () => {
    for (const preset of X_DIMENSION_PRESETS) {
      expect(preset.mm).toBeGreaterThanOrEqual(MIN_X_DIMENSION_MM);
    }
  });

  it("the smallest preset IS the floor", () => {
    const smallest = Math.min(...X_DIMENSION_PRESETS.map((p) => p.mm));
    expect(smallest).toBe(MIN_X_DIMENSION_MM);
  });
});

describe("symbolModuleCount", () => {
  it("subtracts quiet zones from the viewBox", () => {
    expect(symbolModuleCount(QR_GEOM)).toBe(61 - 8 - 8);
    expect(symbolModuleCount(EAN_GEOM)).toBe(113 - 11 - 7);
  });
});

describe("physicalWidthMm", () => {
  it("scales module count by X-dimension", () => {
    expect(physicalWidthMm(0.35, 45)).toBeCloseTo(15.75);
    expect(physicalWidthMm(0.65, 95)).toBeCloseTo(61.75);
  });
});

describe("pngScaleForX — achieved X must never undershoot the request", () => {
  it("rounds UP to an integer px/module scale", () => {
    const { scale, achievedXMm } = pngScaleForX(0.35, 600);
    expect(Number.isInteger(scale)).toBe(true);
    expect(scale).toBe(9); // 0.35mm @600dpi = 8.27px → ceil to 9
    expect(achievedXMm).toBeCloseTo((9 * 25.4) / 600, 5);
    // The whole point: achieved is never below requested.
    expect(achievedXMm).toBeGreaterThanOrEqual(0.35);
  });

  it("an exactly-representable X stays exact", () => {
    // 0.508mm @600dpi = 12px exactly
    const { scale, achievedXMm } = pngScaleForX(0.508, 600);
    expect(scale).toBe(12);
    expect(achievedXMm).toBeCloseTo(0.508, 5);
  });

  it("defaults to the shipped 600 DPI", () => {
    expect(pngScaleForX(0.35).scale).toBe(pngScaleForX(0.35, PNG_DPI).scale);
  });
});

describe("parseViewBox", () => {
  it("reads bwip-js viewBox dimensions", () => {
    expect(
      parseViewBox('<svg xmlns="x" viewBox="0 0 113 77" width="113">')
    ).toEqual({ w: 113, h: 77 });
  });

  it("returns null for a malformed SVG (skip, never guess)", () => {
    expect(parseViewBox("<svg></svg>")).toBeNull();
  });
});

describe("labelLayout — shared X-dimension across the symbol row", () => {
  it("sizes every symbol at the same X and sums widths with gaps/margins", () => {
    const layout = labelLayout(0.35, [QR_GEOM, EAN_GEOM]);
    const qrWidth = 0.35 * (61 - 8 - 8);
    const eanWidth = 0.35 * (113 - 11 - 7);
    expect(layout.items[0].widthMm).toBeCloseTo(qrWidth, 5);
    expect(layout.items[1].widthMm).toBeCloseTo(eanWidth, 5);
    // 2 symbols: widths + 1 gap + 2 margins
    expect(layout.widthMm).toBeCloseTo(qrWidth + eanWidth + 6 + 12, 5);
  });

  it("grows with the X-dimension", () => {
    expect(labelLayout(0.65, [QR_GEOM]).widthMm).toBeGreaterThan(
      labelLayout(0.35, [QR_GEOM]).widthMm
    );
  });
});
