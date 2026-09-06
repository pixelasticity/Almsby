import React from "react";
import Button from "@/components/ui/Button";
import { StoryBlock } from "./StoryStudio";
import styles from "./story-studio.module.css";

interface BlockComposerProps {
  blocks: StoryBlock[];
  updateBlock: (index: number, block: StoryBlock) => void;
  removeBlock: (index: number) => void;
  addBlock: (type: "heading" | "paragraph" | "image") => void;
}

export default function BlockComposer({ blocks, updateBlock, removeBlock, addBlock }: BlockComposerProps) {
  return (
    <div className={styles.composer}>
      {blocks.map((block, index) => (
        <div key={index} className={styles.block}>
          <div className={styles.blockRemove}>
            <Button
              variant="ghost"
              type="button"
              onClick={() => removeBlock(index)}
              style={{ color: "var(--danger-500)", fontSize: "1.25rem" }}
              title="Remove block"
            >
              ×
            </Button>
          </div>

          {block.type === "heading" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <select
                value={block.level}
                onChange={(e) =>
                  updateBlock(index, { ...block, level: parseInt(e.target.value) as 1 | 2 })
                }
                className={styles.blockTypeSelect}
              >
                <option value={1}>H1 - Hero</option>
                <option value={2}>H2 - Section</option>
              </select>
              <input
                type="text"
                value={block.text}
                onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                placeholder="Enter headline..."
                className={`${styles.blockInput} ${styles.blockHeadingInput}`}
              />
            </div>
          )}

          {block.type === "paragraph" && (
            <textarea
              value={block.text}
              onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
              placeholder="Tell the story..."
              rows={3}
              className={`${styles.blockInput} ${styles.blockParagraphInput}`}
            />
          )}

          {block.type === "image" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div className={styles.blockImageArea}>
                {block.url ? (
                  <img src={block.url} alt="Story asset" className={styles.blockImageImg} />
                ) : (
                  <span className={styles.blockImageAreaText}>No image uploaded</span>
                )}
              </div>
              <input
                type="text"
                value={block.url}
                onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                placeholder="R2 Image URL..."
                className={styles.blockInput}
                style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.25rem" }}
              />
            </div>
          )}
        </div>
      ))}

      <div className={styles.blockAddRow}>
        <Button
          variant="ghost"
          type="button"
          onClick={() => addBlock("heading")}
          style={{ color: "var(--neutral-700)", fontWeight: 700 }}
        >
          <span style={{ color: "var(--primary-600)" }}>+</span> Heading
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => addBlock("paragraph")}
          style={{ color: "var(--neutral-700)", fontWeight: 700 }}
        >
          <span style={{ color: "var(--primary-600)" }}>+</span> Paragraph
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => addBlock("image")}
          style={{ color: "var(--neutral-700)", fontWeight: 700 }}
        >
          <span style={{ color: "var(--primary-600)" }}>+</span> Photo
        </Button>
      </div>
    </div>
  );
}

