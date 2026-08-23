import { describe, expect, it } from "vitest";
import { classifyGtinError, type GtinClass } from "@/lib/gs1/gtin";

/**
 * Locks the Phase 1 §4 required test batch to the exact classifier buckets.
 * Every input must classify (no fall-through), and the "invalid" bucket absorbs
 * both non-numeric and all-zero inputs — matching the 3-state inline UI copy.
 */
describe("classifyGtinError (§4 batch)", () => {
  const cases: [string, GtinClass][] = [
    ["00012345678905", "valid"],
    ["04006381333931", "valid"],
    ["00012345678906", "checkDigit"],
    ["123", "length"],
    ["abcd1234567890", "invalid"],
    ["00000000000000", "invalid"],
  ];

  it.each(cases)("%s → %s", (input, expected) => {
    expect(classifyGtinError(input)).toBe(expected);
  });

  it("classifies blank and whitespace as invalid", () => {
    expect(classifyGtinError("")).toBe("invalid");
    expect(classifyGtinError("   ")).toBe("invalid");
  });

  it("classifies 8-digit / 13-digit normalized forms as valid when check digit passes", () => {
    expect(classifyGtinError("4006381333931")).toBe("valid"); // 13 -> 14
    expect(classifyGtinError("12345670")).toBe("valid"); // sample GTIN-8-ish
  });
});