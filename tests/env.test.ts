import { describe, expect, it } from "vitest";
import { isPlaceholderResolverUrl } from "@/lib/env";

describe("isPlaceholderResolverUrl", () => {
  it("accepts the real per-environment resolver domains (#17)", () => {
    expect(isPlaceholderResolverUrl("https://id.almsby.com")).toBe(false);
    expect(isPlaceholderResolverUrl("https://id.staging.almsby.com")).toBe(
      false,
    );
    expect(isPlaceholderResolverUrl("https://id.almsby.com/")).toBe(false);
  });

  it("rejects localhost and loopback placeholder bases", () => {
    expect(isPlaceholderResolverUrl("http://localhost:3000")).toBe(true);
    expect(isPlaceholderResolverUrl("https://localhost")).toBe(true);
    expect(isPlaceholderResolverUrl("http://127.0.0.1:54321")).toBe(true);
    expect(isPlaceholderResolverUrl("127.0.0.1")).toBe(true);
  });

  it("rejects vercel.app default deployment domains", () => {
    expect(isPlaceholderResolverUrl("https://almsby.vercel.app")).toBe(true);
    expect(
      isPlaceholderResolverUrl("https://almsby-preview.vercel.app"),
    ).toBe(true);
    expect(isPlaceholderResolverUrl("https://id.vercel.app")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isPlaceholderResolverUrl("HTTPS://LOCALHOST:3000")).toBe(true);
    expect(isPlaceholderResolverUrl("https://ID.ALMSBY.COM")).toBe(false);
  });
});