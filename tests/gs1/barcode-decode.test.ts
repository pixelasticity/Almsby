/**
 * DoD §10.2 — the automated decode test.
 *
 * Structural checks (barcode.test.ts) prove the SVG is plausible; this suite
 * proves the symbols actually DECODE: rasterize the exact SVG the app ships
 * at print-realistic resolution, feed the pixels to zxing-wasm, and assert
 * the payload round-trips to the GTIN across the edge-case batch.
 */
import { describe, expect, it, beforeAll } from "vitest";
import { toGtin14 } from "@/lib/gs1/gtin";
import {
  verifyBarcode,
  warmBarcodeVerifier,
} from "@/lib/gs1/verify";

// §4 batch representatives, as individually-named cases (not it.each) so a
// decode failure is attributable to the exact GTIN.
const QT_CASES = [
  { name: "13-digit normalized", gtin: toGtin14("4006381333931")! },
  { name: "zero-prefix", gtin: toGtin14("00012345678905")! },
  { name: "documented example", gtin: "00614141123452" },
];

beforeAll(async () => {
  // The renderers build the URI from NEXT_PUBLIC_RESOLVER_URL; the harness
  // reads env directly, so the test must pin the resolver (like the app does).
  process.env.NEXT_PUBLIC_RESOLVER_URL = "https://id.almsby.com";
  // zxing-wasm lazily instantiates its WASM module on the FIRST decode call;
  // this charges the one-time ~600ms init to whatever test ran first (the
  // intermittent 5s-timeout root cause). Pre-warm once so no case pays it.
  // Runs once per test file — CI uses a plain `vitest` (one worker per file).
  await warmBarcodeVerifier();
});

describe("DoD §10.2 — generated symbols decode (per-GTIN)", () => {
  for (const { name, gtin } of QT_CASES) {
    it(`verifies every generated symbol for ${name} (${gtin})`, async () => {
      const v = await verifyBarcode(gtin);
      // The label is a single gate: both symbols must round-trip.
      expect(v.qr.ok).toBe(true);
      expect(v.qr.uri).toBe(`https://id.almsby.com/01/${gtin}`);
      expect(v.dm.ok).toBe(true);
    });
  }
});
