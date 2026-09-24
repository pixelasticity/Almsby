import { describe, expect, it } from "vitest";
import { resolveActionErrorKey } from "@/lib/products/action-errors";

/**
 * Locks both resolver shapes: a rename table (code → a DIFFERENT key, across
 * namespaces) and a plain allowlist (code → itself). Unknown or absent codes
 * must land on the caller's explicit fallback — never leak the raw code to
 * `t()`, which throws on an unknown key.
 */
describe("resolveActionErrorKey", () => {
  const RENAME: Record<string, string> = {
    missingProduct: "gtinErrorMissingProduct",
  };
  const ALLOW: readonly string[] = ["missingProduct", "saveFailed"];

  it("maps through a rename table", () => {
    expect(resolveActionErrorKey("missingProduct", RENAME, "fallback")).toBe(
      "gtinErrorMissingProduct"
    );
  });

  it("passes known allowlist codes through unchanged", () => {
    expect(resolveActionErrorKey("saveFailed", ALLOW, "fallback")).toBe(
      "saveFailed"
    );
  });

  it("returns the fallback for unknown codes in both shapes", () => {
    expect(resolveActionErrorKey("nope", RENAME, "fallback")).toBe("fallback");
    expect(resolveActionErrorKey("nope", ALLOW, "fallback")).toBe("fallback");
  });

  it("returns the fallback when the code is absent", () => {
    expect(resolveActionErrorKey(undefined, RENAME, "fallback")).toBe(
      "fallback"
    );
    expect(resolveActionErrorKey(undefined, ALLOW, "fallback")).toBe(
      "fallback"
    );
  });

  it("treats an empty string code as absent", () => {
    expect(resolveActionErrorKey("", RENAME, "fallback")).toBe("fallback");
    expect(resolveActionErrorKey("", ALLOW, "fallback")).toBe("fallback");
  });
});