/**
 * TipTap JSON content shaping / normalization for StoryPage.bodyContent.
 *
 * StoryPage.bodyContent is an unconstrained Json? column, so it can hold
 * whatever a past writer persisted — including the pre-TipTap "BlockComposer"
 * format (a flat array of { type, text } blocks). TipTap's useEditor crashes
 * hard ("can't access property 'schema', config.doc.type is undefined") when it
 * is handed that legacy array instead of a TipTap JSON document
 * ({ type: "doc", content: [...] }). This module is the single seam that turns
 * the raw DB value into something the editor can safely ingest.
 *
 * Rules:
 *  - A structurally-valid TipTap doc is passed through unchanged.
 *  - The legacy block array is converted block-by-block, preserving the story
 *    text (data is never silently destroyed).
 *  - Anything that is neither is treated as "empty" -> null.
 */

export type TipTapText = { type: "text"; text: string };
export type TipTapHeading = { type: "heading"; attrs: { level: number }; content: TipTapText[] };
export type TipTapParagraph = { type: "paragraph"; content: TipTapText[] };
export type TipTapNode = TipTapHeading | TipTapParagraph;
export type TipTapDoc = { type: "doc"; content: TipTapNode[] };

/** A single legacy BlockComposer block. */
export type StoryBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string };

/** True only for a TipTap document node with at least a content array. */
export function isTipTapDoc(value: unknown): value is TipTapDoc {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "doc" &&
    Array.isArray((value as { content?: unknown }).content)
  );
}

/** Safe string coercion; never throws on non-strings. */
function asText(value: unknown): string {
  return typeof value === "string" && value.length > 0 ? value : "";
}

/** Wrap raw text in the minimal TipTap text node, dropping empties. */
function toTextNodes(value: unknown): TipTapText[] {
  const text = asText(value);
  return text ? [{ type: "text" as const, text }] : [];
}

/** Convert one legacy block into a TipTap node, or null if unrecognized. */
function blockToNode(block: unknown): TipTapNode | null {
  if (typeof block !== "object" || block === null) return null;
  const b = block as { type?: unknown; text?: unknown };
  const textNodes = toTextNodes(b.text);
  if (b.type === "heading") {
    // Legacy composer had no notion of heading levels; default to h2.
    return { type: "heading", attrs: { level: 2 }, content: textNodes };
  }
  if (b.type === "paragraph") {
    return { type: "paragraph", content: textNodes };
  }
  return null;
}

/** The legacy BlockComposer persisted its content as a flat block array. */
function isStoryBlockArray(value: unknown): value is StoryBlock[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Normalize an arbitrary bodyContent value into a TipTap JSON doc.
 * Returns the doc for valid TipTap JSON, converts legacy block arrays,
 * or returns null when the value is nullish / unparseable (empty editor).
 */
export function normalizeTipTapContent(raw: unknown): TipTapDoc | null {
  if (raw == null) return null;
  if (isTipTapDoc(raw)) return raw;
  if (isStoryBlockArray(raw)) {
    const content: TipTapNode[] = [];
    for (const block of raw) {
      const node = blockToNode(block);
      if (node) content.push(node);
    }
    return content.length > 0 ? { type: "doc", content } : null;
  }
  return null;
}
