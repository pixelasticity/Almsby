import { describe, expect, it, beforeEach } from "vitest";
import { buildDigitalLinkUri } from "@/lib/gs1/digital-link";
import { isValidGtinFormat } from "@/lib/gs1/gtin";

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

  it("accepts well-formed GTINs and rejects short ones (stub)", () => {
    expect(isValidGtinFormat("01234567890128")).toBe(true);
    expect(isValidGtinFormat("1234")).toBe(false);
  });
});