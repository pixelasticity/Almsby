import { describe, expect, it } from "vitest";
import {
  validatePrefix,
  composeGtin14,
  nextSequentialGtin,
  hasValidCheckDigit,
} from "@/lib/gs1/allocate";

describe("GS1 sequential allocation", () => {
  it("accepts valid variable-length prefixes", () => {
    for (const p of ["1", "123456", "1234567890", "12345678912"]) {
      expect(validatePrefix(p)).toEqual({ ok: true });
    }
  });

  it("rejects empty, non-numeric, and out-of-range prefixes", () => {
    expect(validatePrefix("")).toEqual({ ok: false, code: "empty" });
    expect(validatePrefix("  ")).toEqual({ ok: false, code: "empty" });
    expect(validatePrefix("12A")).toEqual({ ok: false, code: "nonNumeric" });
    expect(validatePrefix("0123456789012")).toEqual({
      ok: false,
      code: "tooLong",
    });
  });

  it("composes a valid GTIN-14 with a correct check digit", () => {
    // prefix "123456" (6 digits) → 7-item-ref digits → body 1234560000000 + check.
    const g = composeGtin14("123456", 1)!;
    expect(g).toHaveLength(14);
    expect(hasValidCheckDigit(g)).toBe(true);
  });

  it("zero-pads the item reference to its width", () => {
    const g = composeGtin14("123456", 1)!;
    expect(g.slice(6, 13)).toBe("0000001");
  });

  it("returns null when the prefix leaves no item-ref room or overflows", () => {
    expect(composeGtin14("1234567890123", 1)).toBeNull(); // 13-digit prefix, no room
    // overflow: itemWidth=1 → max itemRef 9
    expect(composeGtin14("123456789012", 10)).toBeNull();
  });

  it("nextSequentialGtin advances the item reference", () => {
    const a = nextSequentialGtin("123456", 0)!;
    const b = nextSequentialGtin("123456", 1)!;
    expect(a.slice(6, 13)).toBe("0000001");
    expect(b.slice(6, 13)).toBe("0000002");
  });
});