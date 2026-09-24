import { describe, expect, it } from "vitest";
import { isValidElement, type ReactElement } from "react";
import { findUnsafeHref, renderMark, safeHref } from "@/lib/story/markUtils";

/**
 * Story links are stored in an unconstrained Json? column
 * (StoryPage.bodyContent) and rendered on the PUBLIC story page, so a bad href
 * executes in a consumer's browser, not just the maker's. These tests pin BOTH
 * gates: the render-side allowlist (safeHref / renderMark, for legacy rows)
 * and the write-side walker (findUnsafeHref, which lets the story actions
 * reject a hostile href before it is ever persisted).
 */

describe("safeHref — hrefs that may become an anchor", () => {
  it("accepts absolute http(s), mailto, and site-relative paths", () => {
    expect(safeHref("https://example.com/story")).toBe(
      "https://example.com/story"
    );
    expect(safeHref("http://example.com")).toBe("http://example.com");
    expect(safeHref("mailto:maker@example.com")).toBe("mailto:maker@example.com");
    expect(safeHref("/products/abc")).toBe("/products/abc");
    expect(safeHref("/s/00012345678905?ref=qr")).toBe("/s/00012345678905?ref=qr");
  });

  it("is scheme-case-insensitive and trims surrounding whitespace", () => {
    expect(safeHref("HTTPS://EXAMPLE.COM")).toBe("HTTPS://EXAMPLE.COM");
    expect(safeHref("  https://example.com  ")).toBe("https://example.com");
  });

  it("rejects script-bearing and non-web schemes", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("JaVaScRiPt:alert(1)")).toBeNull();
    expect(safeHref(" JAVASCRIPT:alert(1)")).toBeNull();
    expect(safeHref("data:text/html;base64,PHNjcmlwdD4=")).toBeNull();
    expect(safeHref("vbscript:msgbox(1)")).toBeNull();
    expect(safeHref("file:///etc/passwd")).toBeNull();
  });

  it("rejects protocol-relative and backslash URLs", () => {
    // "//evil.com" leaves the site; browsers normalize "\" to "/", so these
    // spell the same thing. Same bypass lib/auth/redirect.ts guards against.
    expect(safeHref("//evil.com")).toBeNull();
    expect(safeHref("/\\evil.com")).toBeNull();
    expect(safeHref("\\\\evil.com")).toBeNull();
    expect(safeHref("https:\\\\evil.com")).toBeNull();
  });

  it("rejects control characters (URL/header-injection hygiene)", () => {
    expect(safeHref("java\nscript:alert(1)")).toBeNull();
    expect(safeHref("https://exa\u0000mple.com")).toBeNull();
    expect(safeHref("/foo\tbar")).toBeNull();
    expect(safeHref("/foo\u007fbar")).toBeNull();
  });

  it("rejects empty, malformed, and non-string values", () => {
    expect(safeHref("")).toBeNull();
    expect(safeHref("   ")).toBeNull();
    expect(safeHref("https:/example.com")).toBeNull(); // single slash, no authority
    expect(safeHref("www.example.com")).toBeNull(); // scheme-less, not site-relative
    expect(safeHref(undefined)).toBeNull();
    expect(safeHref(null)).toBeNull();
    expect(safeHref(42)).toBeNull();
    expect(safeHref({ href: "https://example.com" })).toBeNull();
  });
});

describe("renderMark — link marks", () => {
  it("renders an anchor for an allowed href", () => {
    const result = renderMark("link", "our story", {
      href: "https://example.com",
    });
    expect(isValidElement(result)).toBe(true);
    const el = result as ReactElement<{
      href: string;
      target: string;
      rel: string;
    }>;
    expect(el.type).toBe("a");
    expect(el.props.href).toBe("https://example.com");
    expect(el.props.target).toBe("_blank");
    expect(el.props.rel).toBe("noopener noreferrer");
  });

  it("renders the text with NO anchor when the href is unusable", () => {
    // A `javascript:` href must never become a link — and must not silently
    // become "#" either; the words simply stay plain text.
    for (const href of [
      "javascript:alert(1)",
      "//evil.com",
      "data:text/html,<script>",
      "",
      undefined,
    ]) {
      const result = renderMark("link", "click me", { href });
      expect(isValidElement(result)).toBe(false);
      expect(result).toBe("click me");
    }
  });

  it("renders the text with NO anchor when the mark has no attrs at all", () => {
    expect(renderMark("link", "click me")).toBe("click me");
    expect(renderMark("link", "click me", {})).toBe("click me");
  });

  it("keeps wrapping the other mark types, and passes unknown marks through", () => {
    expect((renderMark("bold", "b") as ReactElement).type).toBe("strong");
    expect((renderMark("italic", "i") as ReactElement).type).toBe("em");
    expect((renderMark("strike", "s") as ReactElement).type).toBe("del");
    expect(renderMark("underline", "u")).toBe("u");
  });
});

describe("findUnsafeHref — write-side walker", () => {
  const doc = (paragraphContent: unknown) => ({
    type: "doc",
    content: [{ type: "paragraph", content: paragraphContent }],
  });

  it("returns null for a doc with no links at all", () => {
    expect(findUnsafeHref(null)).toBeNull();
    expect(findUnsafeHref(undefined)).toBeNull();
    expect(findUnsafeHref(42)).toBeNull();
    expect(findUnsafeHref(doc([]))).toBeNull();
    expect(findUnsafeHref(doc([{ type: "text", text: "plain" }]))).toBeNull();
  });

  it("returns null when every link href is allowed", () => {
    expect(
      findUnsafeHref(
        doc([
          {
            type: "text",
            text: "our story",
            marks: [{ type: "link", attrs: { href: "https://example.com" } }],
          },
        ])
      )
    ).toBeNull();
  });

  it("finds an unsafe href nested deep in the doc", () => {
    const hostile = doc([
      { type: "text", text: "fine" },
      {
        type: "text",
        text: "click",
        marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
      },
    ]);
    expect(findUnsafeHref(hostile)).toBe("javascript:alert(1)");
  });

  it("reports every href form the renderer's allowlist rejects", () => {
    for (const href of ["//evil.com", "/\\evil.com", "data:text/html,x"]) {
      expect(
        findUnsafeHref(
          doc([
            {
              type: "text",
              text: "x",
              marks: [{ type: "link", attrs: { href } }],
            },
          ])
        )
      ).toBe(href);
    }
  });

  it("treats a missing/absent href as benign (renderMark drops the anchor)", () => {
    expect(
      findUnsafeHref(
        doc([{ type: "text", text: "x", marks: [{ type: "link", attrs: {} }] }])
      )
    ).toBeNull();
    expect(
      findUnsafeHref(doc([{ type: "text", text: "x", marks: [{ type: "link" }] }]))
    ).toBeNull();
    expect(
      findUnsafeHref(
        doc([
          {
            type: "text",
            text: "x",
            marks: [{ type: "link", attrs: { href: null } }],
          },
        ])
      )
    ).toBeNull();
  });

  it("reports non-string hrefs with a type marker instead of crashing", () => {
    expect(
      findUnsafeHref(
        doc([
          {
            type: "text",
            text: "x",
            marks: [{ type: "link", attrs: { href: 42 } }],
          },
        ])
      )
    ).toBe("non-string href (number)");
  });

  it("ignores non-link marks and malformed nodes", () => {
    expect(
      findUnsafeHref(
        doc([
          { type: "text", text: "x", marks: [{ type: "bold" }, "stray", null] },
        ])
      )
    ).toBeNull();
    expect(findUnsafeHref("nonsense")).toBeNull();
  });
});
