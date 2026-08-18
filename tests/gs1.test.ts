import { describe, expect, it, beforeEach } from "vitest";
import { buildDigitalLinkUri } from "@/lib/gs1/digital-link";
import {
  isValidGtinFormat,
  isValidGtin,
  toGtin14,
  hasValidCheckDigit,
} from "@/lib/gs1/gtin";

describe("gs1", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_RESOLVER_URL;
  });

  it("builds Digital Link URIs from NEXT_PUBLIC_RESOLVER_URL only", () => {
    process.env.NEXT_PUBLIC_RESOLVER_URL = "https://lnk.almsby.test";
    expect(buildDigitalLinkUri("01234567890128")).toBe(
      "https://lnk.almsby.test/01/01234567890128"
    );
  });

  it("throws when the resolver URL env var is not set", () => {
    expect(() => buildDigitalLinkUri("01234567890128")).toThrowError(
      "NEXT_PUBLIC_RESOLVER_URL"
    );
  });

  it("accepts well-formed GTINs and rejects short ones", () => {
    expect(isValidGtinFormat("01234567890128")).toBe(true);
    expect(isValidGtinFormat("04006381333931")).toBe(true);
    expect(isValidGtinFormat("1234")).toBe(false);
    expect(isValidGtinFormat("abcd1234567890")).toBe(false);
  });

  it("normalizes GTIN-8/12/13/14 to a 14-digit GTIN-14 (left-padded)", () => {
    expect(toGtin14("04006381333931")).toBe("04006381333931");
    expect(toGtin14("4006381333931")).toBe("04006381333931");
    expect(toGtin14("012345678905")).toBe("00012345678905");
    expect(toGtin14("00012345678905")).toBe("00012345678905");
    expect(toGtin14("1234")).toBeNull();
    expect(toGtin14("abcd1234567890")).toBeNull();
  });

  it("validates the GS1 modulo-10 check digit", () => {
    expect(hasValidCheckDigit("00012345678905")).toBe(true);
    expect(hasValidCheckDigit("04006381333931")).toBe(true);
    expect(hasValidCheckDigit("00012345678906")).toBe(false); // wrong check digit
    expect(hasValidCheckDigit("00000000000000")).toBe(true); // algorithm-valid
    expect(hasValidCheckDigit("123")).toBe(false); // not 14 digits
  });

  it("validates full GTINs and rejects the known-invalid batch (brief §4)", () => {
    expect(isValidGtin("00012345678905")).toBe(true);
    expect(isValidGtin("04006381333931")).toBe(true);
    expect(isValidGtin("00012345678906")).toBe(false);
    expect(isValidGtin("123")).toBe(false);
    expect(isValidGtin("abcd1234567890")).toBe(false);
    expect(isValidGtin("00000000000000")).toBe(false); // all-zero: not a real product
  });
});
