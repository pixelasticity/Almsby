import { NextResponse } from "next/server";
import { isValidGtin, toGtin14 } from "@/lib/gs1/gtin";
import { resolveGtin } from "@/lib/gs1/resolve";
import { getDb } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gtin: string }> }
): Promise<NextResponse> {
  const { gtin } = await params;

  // 1) Validate the GTIN (well-formed + check digit). Invalid → 404.
  //    (an invalid GTIN is an "expected unknown", not a server failure)
  if (!isValidGtin(gtin)) {
    return new NextResponse("Invalid GTIN", { status: 404 });
  }
  const gtin14 = toGtin14(gtin)!;

  // 2) Look up in the database — by value only (domain-agnostic). This route is
  //    intentionally OUTSIDE /api (Phase 0 brief §3): /01/{gtin} is a GS1 spec
  //    path, not an API convention.
  const result = await resolveGtin(getDb(), gtin14);

  switch (result.status) {
    case "notFound": {
      // Expected unknown GTIN → 404 (not a crash). Keep a distinct low-key log
      // so monitoring can tell "expected unknown" from "infra failure".
      console.log(`resolver: unknown GTIN ${gtin14}`);
      return new NextResponse("Product not found", { status: 404 });
    }
    case "unreachable": {
      // Infra failure (DB) → 503, not conflated with a not-found 404.
      console.error(`resolver: DB unreachable for ${gtin14}`);
      return new NextResponse("Service unavailable", { status: 503 });
    }
    case "found":
      break;
  }

  // 3) Found → redirect to the consumer story page. NOTE: this adds a hot-path
  //    round-trip on every scan (same category as the http->https redirect
  //    discussion). Kept for Phase 1 since the story page is a placeholder;
  //    revisit direct rendering once real scan volume exists.
  return NextResponse.redirect(new URL(`/s/${gtin14}`, request.url));
}
