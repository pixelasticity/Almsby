import { describe, expect, it } from "vitest";
import { toErrorMessage } from "@/lib/errors";

describe("toErrorMessage", () => {
  it("passes through a real message", () => {
    expect(toErrorMessage("Email provider unreachable", "Failed")).toBe(
      "Email provider unreachable",
    );
    expect(toErrorMessage(new Error("Timed out"), "Failed")).toBe("Timed out");
    expect(toErrorMessage({ message: "SMTP misconfigured" }, "Failed")).toBe(
      "SMTP misconfigured",
    );
  });

  it("replaces degenerate literals with the fallback", () => {
    const fallback = "Sign-up failed. Please try again.";
    // The `{}` case is the original bug: supabase-js falls back to
    // JSON.stringify of an empty/opaque response body. The others are the same
    // class of bad-stringify literal.
    for (const degenerate of ["{}", "[object Object]", "", "null", "undefined"]) {
      expect(toErrorMessage(degenerate, fallback)).toBe(fallback);
      expect(toErrorMessage(new Error(degenerate), fallback)).toBe(fallback);
      expect(toErrorMessage({ message: degenerate }, fallback)).toBe(fallback);
    }
  });

  it("falls back for empty or non-message values", () => {
    expect(toErrorMessage(null, "fallback")).toBe("fallback");
    expect(toErrorMessage(undefined, "fallback")).toBe("fallback");
    expect(toErrorMessage(42, "fallback")).toBe("fallback");
    expect(toErrorMessage({}, "fallback")).toBe("fallback");
  });

  it("treats whitespace-only messages as degenerate", () => {
    expect(toErrorMessage("   ", "fallback")).toBe("fallback");
  });
});