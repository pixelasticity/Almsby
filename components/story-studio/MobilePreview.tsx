import React from "react";
import { StoryBlock } from "./StoryStudio";
import styles from "./story-studio.module.css";

interface MobilePreviewProps {
  blocks: StoryBlock[];
  isPublished: boolean;
}

export default function MobilePreview({ blocks, isPublished }: MobilePreviewProps) {
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
          {blocks.length === 0 ? (
            <div className={styles.blocksEmpty}>
              <p>Start adding blocks to see the story unfold...</p>
            </div>
          ) : (
            blocks.map((block, index) => {
              if (block.type === "heading") {
                return (
                  <h2
                    key={index}
                    className={`${styles.previewHeading} ${block.level === 1 ? styles.previewHeading1 : styles.previewHeading2}`}
                  >
                    {block.text || "Untitled Heading"}
                  </h2>
                );
              }
              if (block.type === "paragraph") {
                return (
                  <p key={index} className={styles.previewParagraph}>
                    {block.text || "Paragraph content goes here..."}
                  </p>
                );
              }
              if (block.type === "image") {
                return (
                  <div key={index} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div className={styles.previewImage}>
                      {block.url ? (
                        <img src={block.url} alt="Story asset" className={styles.previewImageImg} />
                      ) : (
                        <div className={styles.previewImageEmpty}>Image Asset</div>
                      )}
                    </div>
                    {block.caption && <p className={styles.previewCaption}>{block.caption}</p>}
                  </div>
                );
              }
              return null;
            })
          )}
        </div>
      </div>
    </div>
  );
}

