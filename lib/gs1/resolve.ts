/**
 * Resolver lookup helper for /01/{gtin} (#8).
 *
 * Pure-ish seam: takes a DB delegate and a 14-digit GTIN, returns a typed
 * result so the route can distinguish "expected unknown" (404) from
 * "infra failure" (503). Domain-agnostic by construction — the lookup is by
 * GTIN value only, never by URL host.
 */
import type { Prisma } from "@prisma/client";

// Minimal structural type — the route passes getDb() (which satisfies it), and
// tests can stub only the one method without a full PrismaClient.
export type GtinLookupDb = {
  gTIN: {
    findUnique: (args: {
      where: Prisma.GTINWhereUniqueInput;
    }) => Promise<Prisma.GTINGetPayload<Record<string, never>> | null>;
  };
};

export type ResolveResult =
  | { status: "found"; gtin14: string }
  | { status: "notFound" }
  | { status: "unreachable" };

export async function resolveGtin(
  db: GtinLookupDb,
  gtin14: string
): Promise<ResolveResult> {
  try {
    const found = await db.gTIN.findUnique({
      where: { gtinValue: gtin14 },
    });
    return found ? { status: "found", gtin14 } : { status: "notFound" };
  } catch (error) {
    console.error("resolveGtin: db unreachable", error);
    return { status: "unreachable" };
  }
}