import React from "react";
import styles from "./story-studio.module.css";

interface MobilePreviewProps {
  content: Record<string, unknown> | null;
  isPublished: boolean;
}

type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

/**
 * Renders TipTap JSON for the mobile preview. Because the editor uses a
 * CONSTRAINED schema (paragraph, heading h2/h3, bold, link only), this renderer
 * only needs to handle those node/mark types — no arbitrary HTML, no images,
 * no tables. Unknown node types render as their text content (safe fallback).
 *
 * This is NOT dangerouslySetInnerHTML — every node is mapped to a React
 * element, and the bounded schema guarantees only whitelisted nodes exist.
 */
function renderNode(node: TipTapNode, key: number): React.ReactNode {
  switch (node.type) {
    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const text = extractText(node);
      return (
        <h2
          key={key}
          className={`${styles.previewHeading} ${level === 1 ? styles.previewHeading1 : styles.previewHeading2}`}
        >
          {text || "Untitled Heading"}
        </h2>
      );
    }
    case "paragraph": {
      const children = renderMarks(node);
      return (
        <p key={key} className={styles.previewParagraph}>
          {children ?? "Paragraph content goes here..."}
        </p>
      );
    }
    case "text":
      return renderMarks(node);
    case "doc":
      return node.content?.map((child, i) => renderNode(child, i)) ?? null;
    default:
      // Safe fallback for any unhandled node — render its text, never raw HTML.
      return <React.Fragment key={key}>{extractText(node)}</React.Fragment>;
  }
}

/** Renders a text node's marks (bold, link) as React elements. */
function renderMarks(node: TipTapNode): React.ReactNode {
  if (!node.text) return null;
  if (!node.marks || node.marks.length === 0) return node.text;

  // Apply marks left to right.
  return node.marks.reduce<React.ReactNode>(
    (acc, mark) => {
      if (mark.type === "bold") return <strong key={Math.random()}>{acc}</strong>;
      if (mark.type === "link") {
        const href = (mark.attrs?.href as string) ?? "#";
        return (
          <a key={Math.random()} href={href} target="_blank" rel="noopener noreferrer">
            {acc}
          </a>
        );
      }
      return acc;
    },
    <>{node.text}</>
  );
}

/** Extracts all text content from a node tree (for fallbacks). */
function extractText(node: TipTapNode): string {
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractText).join("");
  return "";
}

export default function MobilePreview({ content, isPublished }: MobilePreviewProps) {
  const nodes = (content as TipTapNode | null)?.content ?? [];

  return (
    <div className={styles.phone}>
      <div className={styles.phoneStatusBar}>
        <span>9:41</span>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <div className={styles.phoneSignal} />
          <div className={styles.phoneSignal} />
        </div>
      </div>

      <div className={styles.phoneContent}>
        {!isPublished && (
          <div className={styles.comingSoon}>
            <div className={styles.comingSoonIcon}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={styles.comingSoonTitle}>Coming Soon</h3>
            <p className={styles.comingSoonText}>
              The maker is still crafting this story. Check back soon for a glimpse into the process.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {nodes.length === 0 ? (
            <div className={styles.blocksEmpty}>
              <p>Start adding blocks to see the story unfold...</p>
            </div>
          ) : (
            nodes.map((node, i) => renderNode(node as TipTapNode, i))
          )}
        </div>
      </div>
    </div>
  );
}


