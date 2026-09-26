import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, imgSrcDirective } from "@/lib/csp";

const NONCE = "abc123";

/** Pull one directive out of a policy string, e.g. "img-src". */
function directive(policy: string, name: string): string {
  const found = policy
    .split("; ")
    .find((entry) => entry === name || entry.startsWith(`${name} `));
  if (!found) throw new Error(`Directive ${name} not found in policy`);
  return found;
}

describe("imgSrcDirective", () => {
  it("always allows same-origin, data: and blob:", () => {
    const value = imgSrcDirective();
    expect(value).toContain("'self'");
    expect(value).toContain("data:");
    expect(value).toContain("blob:");
  });

  it("allows the r2.dev host that story photos are actually served from", () => {
    // The regression this module exists for: without an R2 host in img-src the
    // browser refuses every story photo while the API/URLs look perfectly fine.
    expect(imgSrcDirective()).toContain("https://*.r2.dev");
  });

  it("allows the configured bucket host", () => {
    expect(imgSrcDirective("pub-1234.r2.dev")).toContain(
      "https://pub-1234.r2.dev"
    );
  });

  it("normalizes a scheme and trailing slash out of the configured value", () => {
    expect(imgSrcDirective("https://images.example.test/")).toContain(
      "https://images.example.test"
    );
    expect(imgSrcDirective("https://images.example.test/")).not.toContain(
      "https://images.example.test/"
    );
  });

  it("adds no empty source when the host is unset or blank", () => {
    for (const value of [undefined, "", "   "]) {
      const parts = imgSrcDirective(value).split(" ");
      expect(parts).toEqual(parts.filter((part) => part.length > 0));
      expect(imgSrcDirective(value)).not.toContain("https:// ");
    }
  });

  it("keeps the directive name and order", () => {
    expect(imgSrcDirective("x.example").startsWith("img-src ")).toBe(true);
  });
});

describe("contentSecurityPolicy", () => {
  it("embeds the per-request nonce in script-src", () => {
    const policy = contentSecurityPolicy({ nonce: NONCE });
    expect(directive(policy, "script-src")).toBe(
      `script-src 'self' 'nonce-${NONCE}' 'strict-dynamic'`
    );
  });

  it("carries the img-src fix through to the header value", () => {
    const policy = contentSecurityPolicy({
      nonce: NONCE,
      r2PublicDomain: "pub-1234.r2.dev",
    });
    expect(directive(policy, "img-src")).toContain("https://*.r2.dev");
    expect(directive(policy, "img-src")).toContain("https://pub-1234.r2.dev");
  });

  it("keeps the hardening directives that were already in place", () => {
    const policy = contentSecurityPolicy({ nonce: NONCE });
    expect(directive(policy, "default-src")).toBe("default-src 'self'");
    expect(directive(policy, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(policy, "object-src")).toBe("object-src 'none'");
    expect(directive(policy, "base-uri")).toBe("base-uri 'self'");
    expect(directive(policy, "form-action")).toBe("form-action 'self'");
    expect(directive(policy, "connect-src")).toContain("https://*.supabase.co");
    expect(directive(policy, "form-action")).not.toContain("*");
  });

  it("emits every directive in the name [sources] form CSP expects", () => {
    const policy = contentSecurityPolicy({ nonce: NONCE });
    for (const entry of policy.split("; ")) {
      const [name, ...sources] = entry.split(" ");
      expect(name).toMatch(/^[a-z-]+$/);
      // Most directives name at least one source; a few are flags that stand
      // alone. Anything else with no sources means the builder dropped a host.
      const valueless = new Set(["upgrade-insecure-requests"]);
      if (!valueless.has(name)) {
        expect(sources.length).toBeGreaterThan(0);
      }
    }
  });
});
