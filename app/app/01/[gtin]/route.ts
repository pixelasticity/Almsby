import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gtin: string }> }
): Promise<NextResponse> {
  const { gtin } = await params;

  // Phase 0: prove the GS1-shaped resolver route works. Phase 1+ resolves the
  // GTIN to a product + barcode record and redirects to its story page.
  // Keep this route OUTSIDE /api — /01/{gtin} is a GS1 spec path, not an API
  // convention (Phase 0 brief §3).
  if (!/^\d{14}$/.test(gtin)) {
    return new NextResponse("Invalid GTIN", { status: 404 });
  }

  return NextResponse.redirect(new URL(`/s/${gtin}`, request.url));
}