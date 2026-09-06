"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import BlockComposer from "./BlockComposer";
import MobilePreview from "./MobilePreview";
import PassportSummary from "./PassportSummary";
import styles from "./story-studio.module.css";

export type StoryBlock =
  | { type: "heading"; text: string; level: 1 | 2 }
  | { type: "paragraph"; text: string }
  | { type: "image"; url: string; caption?: string };

type StudioProduct = {
  id: string;
  name: string;
  gtin?: { gtinValue: string } | null;
  countryOfOrigin?: string | null;
  materialComposition?: string | null;
  recyclable?: boolean | null;
  storyPage?: { published: boolean } | null;
};

export default function StoryStudio({ product }: { product: StudioProduct }) {
  const [blocks, setBlocks] = useState<StoryBlock[]>([]);
  const [isPublished, setIsPublished] = useState(product.storyPage?.published ?? false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const addBlock = (type: "heading" | "paragraph" | "image") => {
    const newBlock: StoryBlock =
      type === "image"
        ? { type, url: "" }
        : type === "heading"
          ? { type, text: "", level: 1 }
          : { type, text: "" };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updatedBlock: StoryBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.studio}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>{product.name}</h1>
          <p className={styles.headerSubtitle}>Story Studio</p>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            className={`${styles.status} ${isPublished ? styles.statusLive : styles.statusDraft}`}
          >
            {isPublished ? "● Live" : "○ Draft"}
          </span>
          <Button
            variant={isPublished ? "secondary" : "primary"}
            type="button"
            className={styles.publishBtn}
            onClick={() => setIsPublished(!isPublished)}
          >
            {isPublished ? "Unpublish" : "Publish Story"}
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <div
          className={styles.editPanel}
          style={{ display: activeTab === "preview" ? "none" : "block" }}
        >
          <div className={styles.editInner}>
            <section>
              <h2 className={styles.sectionTitle}>Story Content</h2>
              <BlockComposer
                blocks={blocks}
                updateBlock={updateBlock}
                removeBlock={removeBlock}
                addBlock={addBlock}
              />
            </section>
            <section style={{ paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
              <PassportSummary product={product} />
            </section>
          </div>
        </div>

        <div
          className={styles.previewPanel}
          style={{ display: activeTab === "edit" ? "none" : "block" }}
        >
          <div className={styles.previewInner}>
            <MobilePreview blocks={blocks} isPublished={isPublished} />
          </div>
        </div>
      </main>

      <div className={styles.mobileTabs}>
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`${styles.mobileTab} ${activeTab === "edit" ? styles.mobileTabActive : ""}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`${styles.mobileTab} ${activeTab === "preview" ? styles.mobileTabActive : ""}`}
        >
          Preview
        </button>
      </div>
    </div>
  );
}

