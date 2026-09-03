import { describe, expect, it, vi } from "vitest";
import { resolveGtin, type GtinLookupDb } from "@/lib/gs1/resolve";

// Fresh stub per test so spies never leak between cases. The structural
// GtinLookupDb type lets tests stub only findUnique (no full PrismaClient).
function makeDb(): GtinLookupDb {
  return { gTIN: { findUnique: vi.fn() } } as unknown as GtinLookupDb;
}

describe("resolveGtin", () => {
  it("returns notFound when the DB returns null for a valid GTIN", async () => {
    const db = makeDb();
    vi.spyOn(db.gTIN, "findUnique").mockResolvedValue(null);
    await expect(resolveGtin(db, "00012345678905")).resolves.toEqual({
      status: "notFound",
    });
  });

  it("returns found when a GTIN row exists", async () => {
    const db = makeDb();
    vi.spyOn(db.gTIN, "findUnique").mockResolvedValue({
      gtinValue: "00012345678905",
    } as Awaited<ReturnType<GtinLookupDb["gTIN"]["findUnique"]>>);
    const r = await resolveGtin(db, "00012345678905");
    expect(r.status).toBe("found");
    if (r.status === "found") expect(r.gtin14).toBe("00012345678905");
  });

  it("returns unreachable when the DB throws", async () => {
    const db = makeDb();
    vi.spyOn(db.gTIN, "findUnique").mockRejectedValue(new Error("db down"));
    await expect(resolveGtin(db, "00012345678905")).resolves.toEqual({
      status: "unreachable",
    });
  });
});
