import { Fragment, type ReactNode } from "react";
import { renderMark } from "@/lib/story/markUtils";

/**
 * Shared renderer for TipTap JSON documents.
 *
 * Single source of truth for "TipTap JSON → semantic HTML". Both the studio's
 * MobilePreview and the public story page use this so the two can never drift —
 * the whole point of the studio preview is "what you see is what scans".
 *
 * Because the editor uses a CONSTRAINED schema (paragraph, heading h2-h6, bold,
 * italic, strike, link only), this renderer only needs to handle those node/mark
 * types — no arbitrary HTML, no images, no tables. Unknown node types render as
 * their plain text content (safe fallback). This is NOT dangerouslySetInnerHTML —
 * every node maps to an explicit React element, and the bounded schema guarantees
 * only whitelisted nodes can exist.
 *
 * Pure component (no hooks / event handlers / client APIs): safe as a Server
 * Component and safe to import into the studio's client tree.
 *
 * Styling contract: this emits BARE semantic elements (h2-h6, p, strong, em,
 * del, a) with no CSS classes. Each consumer scopes styles via descendant
 * selectors in its own CSS module, so the same markup can look distinct in the
 * phone preview vs. the public page without this component knowing about either.
 */

export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

type TipTapRendererProps = {
  /** The TipTap JSON document body (the `doc` node's children) or the doc node itself. */
  content: TipTapNode | TipTapNode[] | null;
};

function renderNode(node: TipTapNode, key: number): ReactNode {
  switch (node.type) {
    case "heading": {
      const level = Math.min(Math.max((node.attrs?.level as number) ?? 2, 2), 6);
      const children = node.content?.map((child, i) => renderNode(child, i));
      const Heading = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Heading key={key}>{children ?? "Untitled Heading"}</Heading>
      );
    }
    case "paragraph": {
      const children = node.content?.map((child, i) => renderNode(child, i));
      return <p key={key}>{children ?? "Paragraph content goes here..."}</p>;
    }
    case "text":
      return renderMarks(node);
    case "doc":
      // When passed the full doc node, render its children (the top-level blocks).
      return node.content?.map((child, i) => renderNode(child, i)) ?? null;
    default:
      // Safe fallback for any unhandled node — render its text, never raw HTML.
      return <Fragment key={key}>{extractText(node)}</Fragment>;
  }
}

/**
 * Renders a text node's marks (bold, italic, strike, link) as React elements.
 * Delegates to the shared renderMark() from lib/story/markUtils.tsx so mark
 * rendering is a single source of truth. Marks compose left-to-right; keys are
 * the stable mark index (the marks array is static per text node).
 */
function renderMarks(node: TipTapNode): ReactNode {
  if (!node.text) return null;
  if (!node.marks || node.marks.length === 0) return node.text;

  return node.marks.reduce<ReactNode>(
    (acc, mark) => renderMark(mark.type, acc, mark.attrs),
    node.text
  );
}

/** Extracts all text content from a node tree (for fallbacks). */
function extractText(node: TipTapNode): string {
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractText).join("");
  return "";
}

export default function TipTapRenderer({ content }: TipTapRendererProps) {
  if (!content) return null;
  const nodes = Array.isArray(content) ? content : [content];
  // Normalize: a `doc` node forwards to its own children; a bare block is rendered as-is.
  const blocks = nodes.flatMap((node) =>
    node.type === "doc" ? (node.content ?? []) : [node]
  );
  return <>{blocks.map((node, i) => renderNode(node, i))}</>;
}
