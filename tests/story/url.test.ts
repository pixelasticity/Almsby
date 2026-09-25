import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { storyPageCanonicalUrl, storyPagePath } from "@/lib/story/url";

const ORIGINAL_RESOLVER = process.env.NEXT_PUBLIC_RESOLVER_URL;

beforeEach(() => {
  // env.resolverUrl reads this lazily (a getter), so per-test assignment works.
  process.env.NEXT_PUBLIC_RESOLVER_URL = "https://id.almsby.com";
});

afterEach(() => {
  if (ORIGINAL_RESOLVER === undefined) delete process.env.NEXT_PUBLIC_RESOLVER_URL;
  else process.env.NEXT_PUBLIC_RESOLVER_URL = ORIGINAL_RESOLVER;
});

describe("storyPagePath", () => {
  it("builds the public path from the 14-digit form", () => {
    expect(storyPagePath("04006381333931")).toBe("/s/04006381333931");
  });

  it("normalizes shorter spellings so one product has one URL", () => {
    // The 13-digit EAN-13 form and the 14-digit GTIN-14 are the same product:
    // a link surface must not produce two different paths for it.
    expect(storyPagePath("4006381333931")).toBe("/s/04006381333931");
    expect(storyPagePath("00012345678905")).toBe("/s/00012345678905");
  });

  it("falls back to the raw value when it is not a valid GTIN", () => {
    // Public input must never throw here: the route 404s on a malformed
    // identifier, and this must not turn that 404 into a 500 on the way.
    expect(storyPagePath("not-a-gtin")).toBe("/s/not-a-gtin");
    expect(storyPagePath("00000000000000")).toBe("/s/00000000000000");
  });
});

describe("storyPageCanonicalUrl", () => {
  it("anchors the canonical to the resolver host, not the app host", () => {
    expect(storyPageCanonicalUrl("04006381333931")).toBe(
      "https://id.almsby.com/s/04006381333931",
    );
  });

  it("does not double the slash when the resolver base ends in one", () => {
    process.env.NEXT_PUBLIC_RESOLVER_URL = "https://id.almsby.com///";
    expect(storyPageCanonicalUrl("04006381333931")).toBe(
      "https://id.almsby.com/s/04006381333931",
    );
  });

  it("follows the configured resolver — never a hardcoded domain", () => {
    process.env.NEXT_PUBLIC_RESOLVER_URL = "https://id.staging.almsby.com";
    expect(storyPageCanonicalUrl("04006381333931")).toBe(
      "https://id.staging.almsby.com/s/04006381333931",
    );
  });
});
