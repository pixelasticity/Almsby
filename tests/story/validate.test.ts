/**
 * Unit tests for lib/story/validate.ts — pure logic, no DB/env/auth.
 * Covers: headline normalization + length cap, block parsing (valid shapes,
 * malformed JSON, wrong types, caps), photo URL validation, and the
 * partial-merge contract (each field validated independently).
 */
import { describe, expect, it } from "vitest";
import {
  parseBodyContent,
  validateStoryFields,
} from "@/lib/story/validate";

describe("parseBodyContent", () => {
  it("returns [] for null/undefined/empty-string input", () => {
    expect(parseBodyContent(null)).toEqual([]);
    expect(parseBodyContent(undefined)).toEqual([]);
    expect(parseBodyContent("")).toEqual([]);
  });

  it("parses a valid block array", () => {
    const raw = JSON.stringify([
      { type: "heading", text: "Our story" },
      { type: "paragraph", text: "Made by hand since 1994." },
    ]);
    expect(parseBodyContent(raw)).toEqual([
      { type: "heading", text: "Our story" },
      { type: "paragraph", text: "Made by hand since 1994." },
    ]);
  });

  it("throws on non-string input (never silently coerced)", () => {
    expect(() => parseBodyContent(42)).toThrow("Story content must be text.");
    expect(() => parseBodyContent({ blocks: [] })).toThrow(
      "Story content must be text."
    );
  });

  it("throws on malformed JSON", () => {
    expect(() => parseBodyContent("{not json")).toThrow(
      "Story content could not be read."
    );
  });

  it("throws when the parsed payload is not an array", () => {
    expect(() => parseBodyContent('{"type":"heading"}')).toThrow(
      "Story content must be a list of blocks."
    );
  });

  it("throws on a block with an unknown type", () => {
    const raw = JSON.stringify([{ type: "quote", text: "hi" }]);
    expect(() => parseBodyContent(raw)).toThrow(
      "Story blocks can only be 'heading' or 'paragraph'."
    );
  });

  it("throws on a block missing text or with non-string text", () => {
    expect(() => parseBodyContent('[{"type":"heading"}]')).toThrow();
    expect(() =>
      parseBodyContent('[{"type":"heading","text":123}]')
    ).toThrow("Story block text must be text.");
  });

  it("throws when the block list exceeds the cap", () => {
    const blocks = Array.from({ length: 101 }, () => ({
      type: "paragraph",
      text: "x",
    }));
    expect(() => parseBodyContent(JSON.stringify(blocks))).toThrow(
      /at most 100 blocks/
    );
  });
});

describe("validateStoryFields", () => {
  it("normalizes headline: trims, empty → null", () => {
    const result = validateStoryFields({ headline: "  Handwoven in Oaxaca  " });
    expect(result.headline).toBe("Handwoven in Oaxaca");

    const empty = validateStoryFields({ headline: "   " });
    expect(empty.headline).toBeNull();
  });

  it("throws when the headline exceeds the length cap", () => {
    const long = "x".repeat(201);
    expect(() => validateStoryFields({ headline: long })).toThrow(
      /at most 200 characters/
    );
  });

  it("leaves fields untouched when not provided (partial-merge contract)", () => {
    // Only headline provided → bodyContent and photos come back neutral
    // (null / []), and the caller only writes what it passed.
    const result = validateStoryFields({ headline: "Title" });
    expect(result.bodyContent).toBeNull();
    expect(result.photos).toEqual([]);
  });

  it("passes through valid photos and rejects bad ones", () => {
    const good = validateStoryFields({
      photos: ["https://pub-abc.r2.dev/story-photos/p1/a.jpg"],
    });
    expect(good.photos).toHaveLength(1);

    expect(() =>
      validateStoryFields({ photos: ["http://insecure.example/a.jpg"] })
    ).toThrow("Each photo must be a valid https URL.");
    expect(() => validateStoryFields({ photos: ["not a url"] })).toThrow(
      "Each photo must be a valid https URL."
    );
  });

  it("enforces the photo count cap", () => {
    const urls = Array.from(
      { length: 13 },
      (_, i) => `https://example.test/${i}.jpg`
    );
    expect(() => validateStoryFields({ photos: urls })).toThrow(
      /at most 12 photos/
    );
  });

  it("round-trips a full wizard payload (all three fields)", () => {
    const result = validateStoryFields({
      headline: "From field to shelf",
      bodyContent: JSON.stringify([
        { type: "heading", text: "How it's made" },
        { type: "paragraph", text: "Small-batch, always." },
      ]),
      photos: ["https://pub-abc.r2.dev/story-photos/p1/a.jpg"],
    });
    expect(result.headline).toBe("From field to shelf");
    expect(result.bodyContent).toEqual([
      { type: "heading", text: "How it's made" },
      { type: "paragraph", text: "Small-batch, always." },
    ]);
    expect(result.photos).toHaveLength(1);
  });
});
