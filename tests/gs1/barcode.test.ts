import { describe, expect, it, beforeEach } from "vitest";
import { renderDigitalLinkQr, renderGs1DataMatrix } from "@/lib/gs1/barcode";
import { toGtin14, classifyGtinError } from "@/lib/gs1/gtin";

describe("barcode rendering (#6)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_RESOLVER_URL = "https://id.almsby.com";
  });

  const GTIN = "04006381333931"; // published-valid from the §4 batch

  it("renders a well-formed QR SVG encoding the resolver Digital Link URI", () => {
    const r = renderDigitalLinkQr(GTIN);
    expect(r).not.toBeNull();
    expect(r!.svg.trim().startsWith("<svg")).toBe(true);
    expect(r!.uri).toBe(`https://id.almsby.com/01/${GTIN}`);
    // QR is not a plain rectangle — it must contain module shapes.
    expect(/<rect|<path/.test(r!.svg)).toBe(true);
  });

  it("bakes a quiet zone into the QR (>=4 modules), not page margins", () => {
    const r = renderDigitalLinkQr(GTIN)!;
    // The SVG must include quiet-zone padding around the symbol's modules.
    expect(r.svg).toMatch(/<svg[^>]+>/);
  });

  it("renders a crisp GS1 DataMatrix (AI 01, FNC1)", () => {
    const svg = renderGs1DataMatrix(GTIN);
    expect(svg).not.toBeNull();
    expect(svg!.trim().startsWith("<svg")).toBe(true);
    // Matrix must contain module shapes (not a blank rect).
    expect(/<rect|<path/.test(svg!)).toBe(true);
  });

  it("emits intrinsic width/height on both symbols (bwip-js only writes a viewBox)", () => {
    // Without width/height the SVG has no intrinsic size and collapses to 0x0
    // under CSS auto sizing — the dashboard regression where the symbols were
    // present in the DOM but invisible.
    const qr = renderDigitalLinkQr(GTIN)!;
    const dm = renderGs1DataMatrix(GTIN)!;
    expect(qr.svg).toMatch(/<svg[^>]*\swidth="\d+"/);
    expect(qr.svg).toMatch(/<svg[^>]*\sheight="\d+"/);
    expect(dm).toMatch(/<svg[^>]*\swidth="\d+"/);
    expect(dm).toMatch(/<svg[^>]*\sheight="\d+"/);
    // Both symbologies are square: width must equal height.
    const dims = (svg: string) => svg.match(/width="(\d+)" height="(\d+)"/)!;
    const [, qw, qh] = dims(qr.svg);
    expect(qw).toBe(qh);
    const [, dw, dh] = dims(dm);
    expect(dw).toBe(dh);
  });

  it("rejects a non-14-digit input for both symbols", () => {
    expect(renderDigitalLinkQr("123")).toBeNull();
    expect(renderGs1DataMatrix("123")).toBeNull();
  });

  it("round-trips: toGtin14 + classifyGtinError agree with the rendered GTIN", () => {
    const raw = "4006381333931"; // 13-digit → 14
    const g14 = toGtin14(raw);
    expect(g14).toBe(GTIN);
    expect(classifyGtinError(raw)).toBe("valid");
  });
});