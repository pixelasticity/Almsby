import { describe, expect, it } from "vitest";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";

describe("sanitizeRedirectPath", () => {
  it("passes safe relative paths through", () => {
    expect(sanitizeRedirectPath("/products")).toBe("/products");
    expect(sanitizeRedirectPath("/products/abc?x=1")).toBe("/products/abc?x=1");
    expect(sanitizeRedirectPath("/foo//bar")).toBe("/foo//bar");
  });

  it("falls back on empty or missing input", () => {
    expect(sanitizeRedirectPath(undefined)).toBe("/dashboard");
    expect(sanitizeRedirectPath(null)).toBe("/dashboard");
    expect(sanitizeRedirectPath("")).toBe("/dashboard");
  });

  it("rejects non-relative and protocol-relative targets", () => {
    expect(sanitizeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
  });

  it("rejects backslash tricks that browsers normalize into //", () => {
    expect(sanitizeRedirectPath("/\\evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("\\\\evil.com")).toBe("/dashboard");
  });

  it("rejects control characters", () => {
    expect(sanitizeRedirectPath("/x\r\nSet-Cookie: 1")).toBe("/dashboard");
  });

  it("honors a custom fallback", () => {
    expect(sanitizeRedirectPath("//evil.com", "/sign-in")).toBe("/sign-in");
  });
});
