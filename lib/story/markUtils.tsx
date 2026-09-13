import type { CSSProperties, ReactNode } from "react";

/**
 * Shared mark configuration for the Story Studio editor.
 * Centralizes the pure-toggle mark types (bold, italic, strike) so they can be
 * reused across the toolbar and any future places that need mark formatting.
 * Links are handled by LinkButton (inline input), not a toolbar action map.
 * Kept as a .tsx because the renderMark helpers return JSX nodes.
 */

export type MarkAction = {
  /** Display label for the button. */
  label: string;
  /** Inline style applied to the button (e.g. { fontWeight: 700 }). */
  style: CSSProperties;
};

/** Mapping of mark type -> toolbar action definition. */
export const markActions: Record<string, MarkAction> = {
  bold: {
    label: "B",
    style: { fontWeight: 700 },
  },
  italic: {
    label: "I",
    style: { fontStyle: "italic" },
  },
  strike: {
    label: "S",
    style: { textDecoration: "line-through" },
  },
};

type MarkAttrs = Record<string, unknown>;

/**
 * Renders a single text content through one mark into the appropriate React
 * element. `content` is whatever React node already accumulated (a string or
 * a wrapped element) so marks compose left-to-right.
 */
export function renderMark(
  markType: string,
  content: ReactNode,
  markAttrs?: MarkAttrs
): ReactNode {
  switch (markType) {
    case "bold":
      return <strong>{content}</strong>;
    case "italic":
      return <em>{content}</em>;
    case "strike":
      return <del>{content}</del>;
    case "link": {
      const href = (markAttrs?.href as string) ?? "#";
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }
    default:
      return content;
  }
}