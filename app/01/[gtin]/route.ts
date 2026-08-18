import { NextResponse } from "next/server";
import { isValidGtin } from "@/lib/gs1/gtin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gtin: string }> }
): Promise<NextResponse> {
  const { gtin } = await params;

  // Phase 1: validate the GTIN (well-formed + check digit); 404 if invalid.
  // Phase 2+ resolves the GTIN to a product + barcode record before redirecting.
  // Keep this route OUTSIDE /api — /01/{gtin} is a GS1 spec path, not an API
  // convention (Phase 0 brief §3).
  if (!isValidGtin(gtin)) {
    return new NextResponse("Invalid GTIN", { status: 404 });
  }

  return NextResponse.redirect(new URL(`/s/${gtin}`, request.url));
}
