/**
 * DoD §10.2 — the automated decode test.
 *
 * Structural checks (barcode.test.ts) prove the SVG is plausible; this suite
 * proves the symbols actually DECODE: rasterize the exact SVG the app ships
 * at print-realistic resolution, feed the pixels to zxing-wasm, and assert
 * the payload round-trips to the GTIN across the edge-case batch.
 */
import { readBarcodesFromImageData } from "zxing-wasm/reader";
import { Resvg } from "@resvg/resvg-js";
import { beforeAll, describe, expect, it } from "vitest";
import { renderDigitalLinkQr, renderGs1DataMatrix } from "@/lib/gs1/barcode";
import { toGtin14 } from "@/lib/gs1/gtin";

const RESOLVER = "https://id.almsby.com";

// §4 batch representatives: 13-digit input normalized to GTIN-14, a GTIN-14
// with a zero prefix, and the documented example GTIN.
const GTINS_14 = ["04006381333931", "00012345678905", "00614141123452"].map(
  (g) => toGtin14(g) ?? g
);

type ImageDataLike = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

/** Rasterize an SVG the way a print pipeline would: fixed pixel width. */
function rasterize(svg: string, width: number): ImageDataLike {
  const rendered = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
  }).render();
  const px = rendered.pixels;
  // bwip-js SVGs have a transparent background: quiet zones are RGBA(0,0,0,0).
  // Composite onto white, or decoders see an all-black image and find nothing.
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3] / 255;
    px[i] = Math.round(px[i] * a + 255 * (1 - a));
    px[i + 1] = Math.round(px[i + 1] * a + 255 * (1 - a));
    px[i + 2] = Math.round(px[i + 2] * a + 255 * (1 - a));
    px[i + 3] = 255;
  }
  return {
    data: new Uint8ClampedArray(px),
    width: rendered.width,
    height: rendered.height,
  };
}

async function decode(image: ImageDataLike) {
  // Duck-typed ImageData: zxing-wasm reads data/width/height.
  const imageData = image as unknown as ImageData;
  return readBarcodesFromImageData(imageData, {
    tryHarder: true,
    formats: ["QRCode", "DataMatrix"],
  });
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_RESOLVER_URL = RESOLVER;
});

describe("DoD §10.2 — rendered symbols decode (QR)", () => {
  it.each(GTINS_14)("QR for %s decodes to the Digital Link URI", (gtin) => {
    const rendered = renderDigitalLinkQr(gtin);
    expect(rendered).not.toBeNull();
    expect(rendered!.uri).toBe(`${RESOLVER}/01/${gtin}`);
    return expect(decode(rasterize(rendered!.svg, 600))).resolves.toContainEqual(
      expect.objectContaining({ text: `${RESOLVER}/01/${gtin}` })
    );
  });
});

describe("DoD §10.2 — rendered symbols decode (GS1 DataMatrix)", () => {
  it.each(GTINS_14)("DataMatrix for %s decodes to AI(01)+GTIN", async (gtin) => {
    const svg = renderGs1DataMatrix(gtin);
    expect(svg).not.toBeNull();
    // zxing may render GS1 content as "(01)0400…" (AI-formatted) or raw
    // "010400…"; assert on the digits so either formatting passes.
    const results = await decode(rasterize(svg!, 400));
    const digits = results
      .filter((r) => r.isValid)
      .map((r) => r.text.replace(/[^0-9]/g, ""));
    expect(digits.some((d) => d.includes(`01${gtin}`))).toBe(true);
  });
});
