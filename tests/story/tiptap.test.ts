import { describe, expect, it } from "vitest";
import {
  isTipTapDoc,
  normalizeTipTapContent,
  type TipTapDoc,
} from "@/lib/story/tiptap";

describe("normalizeTipTapContent", () => {
  it("returns null for nullish values", () => {
    expect(normalizeTipTapContent(null)).toBeNull();
    expect(normalizeTipTapContent(undefined)).toBeNull();
  });

  it("returns null for unsupported / garbage shapes", () => {
    expect(normalizeTipTapContent("a string")).toBeNull();
    expect(normalizeTipTapContent(42)).toBeNull();
    expect(normalizeTipTapContent({})).toBeNull();
    expect(normalizeTipTapContent({ type: "paragraph" })).toBeNull();
    expect(normalizeTipTapContent({ type: "doc" })).toBeNull(); // missing content[]
  });

  it("passes a structurally-valid TipTap doc through", () => {
    const doc: TipTapDoc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "hello" }] },
      ],
    };
    expect(normalizeTipTapContent(doc)).toBe(doc);
  });

  it("converts a legacy heading block into a heading node", () => {
    const result = normalizeTipTapContent([
      { type: "heading" as const, text: "What even is this" },
    ]);
    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "What even is this" }],
        },
      ],
    });
  });

  it("converts a legacy paragraph block into a paragraph node", () => {
    const result = normalizeTipTapContent([
      { type: "paragraph" as const, text: "A long, long time ago, I can still remember." },
    ]);
    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "A long, long time ago, I can still remember." },
          ],
        },
      ],
    });
  });

  it("preserves the full legacy array from production (the crash input)", () => {
    // This is the exact value stored in StoryPage for the affected product.
    const legacy = [
      { text: "What even is this", type: "heading" },
      { text: "A long, long time ago, I can still remember.", type: "paragraph" },
    ];
    const result = normalizeTipTapContent(legacy);
    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "What even is this" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "A long, long time ago, I can still remember." },
          ],
        },
      ],
    });
    expect(isTipTapDoc(result)).toBe(true);
  });

    it("drops unrecognized legacy block types but keeps recognized ones", () => {
    const legacy: unknown[] = [
      { type: "paragraph", text: "kept" },
      { type: "image", src: "nope" }, // unrecognized — ignored
      { type: "heading", text: "also kept" },
    ];
    const result = normalizeTipTapContent(legacy);
    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "kept" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "also kept" }],
        },
      ],
    });
  });

  it("degrades an all-unrecognized legacy array to null", () => {
    const legacy: unknown[] = [{ type: "image", src: "x" }];
    expect(normalizeTipTapContent(legacy)).toBeNull();
  });

  it("treats an empty legacy array as null (empty editor)", () => {
    expect(normalizeTipTapContent([])).toBeNull();
  });
});

describe("isTipTapDoc", () => {
  it("true for a doc with a content array", () => {
    expect(isTipTapDoc({ type: "doc", content: [] })).toBe(true);
  });
  it("false for null / non-objects / wrong type / missing content", () => {
    expect(isTipTapDoc(null)).toBe(false);
    expect(isTipTapDoc({ type: "doc" })).toBe(false);
    expect(isTipTapDoc({ type: "paragraph", content: [] })).toBe(false);
    expect(isTipTapDoc("doc")).toBe(false);
  });
});
