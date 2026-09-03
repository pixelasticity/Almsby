/**
 * PNG export for label symbols (#9, brief §7: "PNG (screen preview)" at print
 * resolution).
 *
 * The download=verified invariant, enforced server-side:
 *   1. The SVG rasterized here is produced by the SAME pure renderers the
 *      verify harness decodes — a PNG can only be generated from a symbol
 *      that has passed per-generation decode verification (re-verified on
 *      every request; the URL is guessable, the client button alone is not
 *      the gate).
 *   2. The raster scale is computed so the achieved X-dimension is at or
 *      above the requested one (never below the floor) at a real DPI, and
 *      the pHYs chunk stamps that DPI into the file so print tools size it
 *      correctly.
 */
import { NextResponse } from "next/server";
import { Resvg } from "@resvg/resvg-js";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { toGtin14 } from "@/lib/gs1/gtin";
import {
  renderDigitalLinkQr,
  renderGs1DataMatrix,
  renderLegacyBarcode,
} from "@/lib/gs1/barcode";
import {
  MIN_X_DIMENSION_MM,
  PNG_DPI,
  parseViewBox,
  pngScaleForX,
} from "@/lib/gs1/print-size";
import { verifyBarcode, warmBarcodeVerifier } from "@/lib/gs1/verify";

export const runtime = "nodejs";

/** CRC32 (PNG chunk checksum) — small table-free implementation. */
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Stamp a pHYs chunk (pixels-per-meter) into a PNG so printers/DTP tools
 * place the image at true physical size. Inserted right after IHDR.
 */
function stampPngDpi(png: Uint8Array, dpi: number): Uint8Array {
  const ppm = Math.round(dpi / 0.0254);
  const phys = new Uint8Array(21); // 4 len + 4 type + 9 data + 4 crc
  const view = new DataView(phys.buffer);
  view.setUint32(0, 9); // data length
  phys.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  view.setUint32(8, ppm); // pixels per unit, X
  view.setUint32(12, ppm); // pixels per unit, Y
  phys[16] = 1; // unit: meter
  view.setUint32(17, crc32(phys.subarray(4, 17)));
  // Find end of IHDR chunk: signature(8) + IHDR len(4) + type(4) + data(13) + crc(4)
  const insertAt = 8 + 4 + 4 + 13 + 4;
  const out = new Uint8Array(png.length + phys.length);
  out.set(png.subarray(0, insertAt), 0);
  out.set(phys, insertAt);
  out.set(png.subarray(insertAt), insertAt + phys.length);
  return out;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol") ?? "";
  const xParam = Number(url.searchParams.get("x"));

  if (!["qr", "dm", "legacy"].includes(symbol)) {
    return new NextResponse("Unknown symbol", { status: 400 });
  }
  // The floor is enforced in code, not just in the UI preset list.
  const xMm = Number.isFinite(xParam) ? xParam : MIN_X_DIMENSION_MM;
  if (xMm < MIN_X_DIMENSION_MM || xMm > 3) {
    return new NextResponse("X-dimension out of range", { status: 400 });
  }

  let gtin14: string | null = null;
  try {
    const db = getDb();
    const product = await db.product.findFirst({
      where: { id, business: { ownerId: user.id } },
      include: { gtin: true },
    });
    if (!product || !product.gtin) {
      return new NextResponse("Not found", { status: 404 });
    }
    gtin14 = toGtin14(product.gtin.gtinValue);
  } catch (error) {
    console.error("[label-png] load failed", id, error);
    return new NextResponse("Not found", { status: 404 });
  }
  if (!gtin14) return new NextResponse("Not found", { status: 404 });

  // Fail-closed re-verification: the URL is guessable, so the client-side
  // disabled button is NOT the gate. A symbol is served only if the live
  // decode round-trip passes right now — the same check that drives the
  // label page badge.
  await warmBarcodeVerifier();
  const verification = await verifyBarcode(gtin14);
  const symbolVerified =
    symbol === "qr"
      ? verification.qr.ok
      : symbol === "dm"
        ? verification.dm.ok
        : verification.legacy.ok;
  if (!symbolVerified) {
    return new NextResponse("Symbol failed decode verification", {
      status: 409,
    });
  }

  // Rendered by the same pure functions the verify harness just decoded.
  const rendered =
    symbol === "qr"
      ? renderDigitalLinkQr(gtin14)?.svg
      : symbol === "dm"
        ? renderGs1DataMatrix(gtin14)
        : renderLegacyBarcode(gtin14)?.svg;
  if (!rendered) return new NextResponse("Symbol not available", { status: 404 });

  const vb = parseViewBox(rendered);
  if (!vb) return new NextResponse("Render failed", { status: 500 });

  // Rasterize at an integer px/module scale that achieves >= the requested
  // X-dimension at PNG_DPI — never below it.
  const { scale } = pngScaleForX(xMm, PNG_DPI);
  const png = new Resvg(rendered, {
    fitTo: { mode: "width", value: Math.round(vb.w * scale) },
    background: "#ffffff",
  }).render().asPng();

  const stamped = stampPngDpi(new Uint8Array(png), PNG_DPI);
  const filename = `almsby-${gtin14}-${
    symbol === "qr" ? "qr" : symbol === "dm" ? "datamatrix" : "ean13"
  }.png`;

  return new NextResponse(new Uint8Array(stamped), {
    status: 200,
    headers: {
      "content-type": "image/png",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
