import type { CSSProperties, ReactNode } from "react";

/**
 * Shared mark configuration for the Story Studio editor.
 * Centralizes the pure-toggle mark types (bold, italic, strike) so they can be
 * reused across the toolbar and any future places that need mark formatting.
 * Links are handled by LinkButton (inline input), not a toolbar action map —
 * and their stored hrefs are re-validated at render time by safeHref, because
 * the editor's input check is not a trust boundary.
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
 * Href forms a stored link mark may become: absolute http(s), mailto, and
 * site-relative paths. Deliberately a short allowlist — the editor's LinkButton
 * only ever produces http(s) links, so nothing legitimate needs more.
 */
const ALLOWED_HREF_PREFIXES = ["https://", "http://", "mailto:", "/"];

/**
 * Shapes that must never reach an `<a>`: any backslash (browsers normalize "\"
 * to "/", so "/\evil.com" is "//evil.com"), and control characters (URL/header
 * injection hygiene). Same discipline as lib/auth/redirect.ts.
 */
const UNSAFE_HREF_PATTERN = /[\u0000-\u001f\u007f\\]/;

/**
 * Validate a stored link mark's href before it becomes an anchor.
 *
 * StoryPage.bodyContent is an unconstrained Json? column, and
 * normalizeTipTapContent passes structurally-valid docs through UNCHANGED — so
 * a link mark can carry any href a past writer, a legacy row, or a tampered
 * save put there, and the public story page renders it for consumers. The
 * editor validates http(s) on input, but a client-side check is never a trust
 * boundary; this is the server-rendered gate.
 *
 * Returns the trimmed href when it is explicitly allowed, or null when the
 * caller must render the text WITHOUT an anchor (never a fallback "#", which
 * would silently link the words to the top of the page).
 */
export function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (!href) return null;
  if (UNSAFE_HREF_PATTERN.test(href)) return null;
  // Protocol-relative URLs are rejected before the "/" prefix could admit them.
  if (href.startsWith("//")) return null;
  const lower = href.toLowerCase();
  return ALLOWED_HREF_PREFIXES.some((prefix) => lower.startsWith(prefix))
    ? href
    : null;
}

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
      const href = safeHref(markAttrs?.href);
      // An unusable href renders as plain text: no anchor, and no guessed "#".
      if (!href) return content;
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