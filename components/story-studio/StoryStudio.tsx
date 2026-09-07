"use client";

import React, { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import TipTapEditor from "./TipTapEditor";
import MobilePreview from "./MobilePreview";
import PassportSummary from "./PassportSummary";
import { saveStoryAction, publishStoryAction } from "@/app/(dashboard)/products/[id]/studio/actions";
import styles from "./story-studio.module.css";

type StudioProduct = {
  id: string;
  name: string;
  gtin?: { gtinValue: string } | null;
  countryOfOrigin?: string | null;
  materialComposition?: string | null;
  recyclable?: boolean | null;
  storyPage?: { id: string; published: boolean; bodyContent: unknown } | null;
};

export default function StoryStudio({ product }: { product: StudioProduct }) {
  // TipTap JSON content — stored directly in StoryPage.bodyContent.
  const [content, setContent] = useState<Record<string, unknown> | null>(
    (product.storyPage?.bodyContent as Record<string, unknown>) ?? null
  );
  const [isPublished, setIsPublished] = useState(product.storyPage?.published ?? false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveStoryAction(product.id, content);
      if (result?.error) setError(result.error);
    });
  };

  const handlePublish = () => {
    setError(null);
    startTransition(async () => {
      const published = !isPublished;
      const result = await publishStoryAction(product.id, content, published);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsPublished(published);
      }
    });
  };

  return (
    <div className={styles.studio}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>{product.name}</h1>
          <p className={styles.headerSubtitle}>Story Studio</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            className={`${styles.status} ${isPublished ? styles.statusLive : styles.statusDraft}`}
          >
            {isPublished ? "● Live" : "○ Draft"}
          </span>
          <Button
            variant="secondary"
            type="button"
            pending={isPending}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant={isPublished ? "secondary" : "primary"}
            type="button"
            pending={isPending}
            onClick={handlePublish}
          >
            {isPublished ? "Unpublish" : "Publish Story"}
          </Button>
        </div>
      </header>

      {error && (
        <div style={{ padding: "0.5rem 1.5rem", background: "var(--danger-100)", color: "var(--danger-700)" }}>
          {error}
        </div>
      )}

      <main className={styles.main}>
        <div
          className={styles.editPanel}
          style={{ display: activeTab === "preview" ? "none" : "block" }}
        >
          <div className={styles.editInner}>
            <section>
              <h2 className={styles.sectionTitle}>Story Content</h2>
              <TipTapEditor content={content} onChange={setContent} />
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
            <MobilePreview content={content} isPublished={isPublished} />
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


