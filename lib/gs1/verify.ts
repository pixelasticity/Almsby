/**
 * Per-generation barcode verification (#7): rasterize the exact SVG the app
 * ships (resvg) at a print-realistic resolution and assert a zxing-wasm decode
 * round-trip. This is the same harness the CI batch uses — applied per-barcode
 * at generation time so a maker sees "verified" or "failed decode" before they
 * print or download, not just at build time.
 */

import { readBarcodesFromImageData, getZXingModule } from "zxing-wasm/reader";
import { Resvg } from "@resvg/resvg-js";
import { renderDigitalLinkQr, renderGs1DataMatrix } from "./barcode";

/** Resolution levers (measured in the #7 flake work): 400px decodes 3/3
 *  with ~30% less rasterize time than 600px. */
const QR_RASTER_PX = 400;
const DM_RASTER_PX = 400;

export type BarcodeVerification = {
  qr: { ok: boolean; uri: string | null };
  dm: { ok: boolean };
};

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
  const imageData = image as unknown as ImageData;
  return readBarcodesFromImageData(imageData, {
    tryHarder: true,
    formats: ["QRCode", "DataMatrix"],
  });
}

function digitsOf(results: Awaited<ReturnType<typeof decode>>) {
  return results
    .filter((r) => r.isValid)
    .map((r) => r.text.replace(/[^0-9]/g, ""));
}

/**
 * Verify both symbols for a GTIN-14 decode to exactly what they should encode.
 * Returns per-symbol success, never throws — a regression surfaces as a clear
 * `ok: false`, the "fail-closed, visible" signal a maker can act on.
 * Caller must pre-warm once with `warmBarcodeVerifier()` (the WASM module cost
 * is a one-time tax, not a per-call one).
 */
export async function verifyBarcode(
  gtin14: string
): Promise<BarcodeVerification> {
  const qr = renderDigitalLinkQr(gtin14);
  const dm = renderGs1DataMatrix(gtin14);

  let qrOk = false;
  let uri: string | null = null;
  if (qr) {
    uri = qr.uri;
    const results = await decode(rasterize(qr.svg, QR_RASTER_PX));
    qrOk = results.some((r) => r.text === qr.uri);
  }

  let dmOk = false;
  if (dm) {
    const results = await decode(rasterize(dm, DM_RASTER_PX));
    const digits = digitsOf(results);
    // zxing may render GS1 content as "(01)0400…" (AI-formatted) or raw
    // "010400…"; assert on the digits so either formatting passes.
    dmOk = digits.some((d) => d.includes(`01${gtin14}`));
  }

  return { qr: { ok: qrOk, uri }, dm: { ok: dmOk } };
}

/**
 * Pre-warm zxing-wasm once per process: it lazily instantiates the WASM module
 * on the FIRST decode call, taxing whichever caller runs first (~600ms). Call
 * this once on the server after boot (or in a test's beforeAll) so the first
 * real verification isn't slow.
 */
export async function warmBarcodeVerifier(): Promise<void> {
  await getZXingModule();
}