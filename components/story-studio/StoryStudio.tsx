"use client";

import React, { useEffect, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import TipTapEditor from "./TipTapEditor";
import EditorErrorBoundary from "./EditorErrorBoundary";
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
  const [error, setError] = useState<string | null>(null);

  // Independent pending flags so Save and Publish each give their own feedback
  // (previously they shared one flag, so a save would gray out Publish too).
  const [isSaving, startSaving] = useTransition();
  const [isPublishing, startPublishing] = useTransition();

  // Snapshot of the last successfully-persisted content, used for dirty tracking.
  const [savedContent, setSavedContent] = useState<Record<string, unknown> | null>(content);
  // "idle" (nothing to report) | "saved" (brief confirmation) — errors go to the banner.
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  // Dirty = current editor content differs from what's been persisted.
  const hasUnsavedChanges =
    JSON.stringify(content) !== JSON.stringify(savedContent);

  // Auto-clear the "Saved" confirmation after a moment so it never lingers stale.
  useEffect(() => {
    if (saveStatus !== "saved") return;
    const timer = setTimeout(() => setSaveStatus("idle"), 3000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  const handleSave = () => {
    if (isSaving) return;
    setError(null);
    setSaveStatus("idle");
    startSaving(async () => {
      const result = await saveStoryAction(product.id, content);
      if (result?.error) {
        setError(result.error);
        return;
      }
      // Only mark saved on success so a failed save stays "dirty".
      setSavedContent(content);
      setSaveStatus("saved");
    });
  };

  const handlePublish = () => {
    if (isPublishing) return;
    setError(null);
    startPublishing(async () => {
      const published = !isPublished;
      const result = await publishStoryAction(product.id, content, published);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsPublished(published);
        // Publish also persists content, so clear the dirty state on success.
        setSavedContent(content);
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
            role="status"
            aria-label={isPublished ? "Story status: Live" : "Story status: Draft"}
          >
            {isPublished ? "● Live" : "○ Draft"}
          </span>
          {hasUnsavedChanges && (
            <span className={`${styles.status} ${styles.unsaved}`} aria-hidden="true">
              • Unsaved
            </span>
          )}
          <Button
            variant="secondary"
            type="button"
            pending={isSaving}
            pendingLabel="Saving…"
            onClick={handleSave}
          >
            Save
          </Button>
          {saveStatus === "saved" && (
            <span className={`${styles.status} ${styles.statusLive}`}>Saved ✓</span>
          )}
          <Button
            variant={isPublished ? "secondary" : "primary"}
            type="button"
            pending={isPublishing}
            onClick={handlePublish}
          >
            {isPublished ? "Unpublish" : "Publish Story"}
          </Button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          style={{ padding: "0.5rem 1.5rem", background: "var(--danger-100)", color: "var(--danger-700)" }}
        >
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
              <h2 className={styles.sectionTitle} id="story-content-heading">
                Story Content
              </h2>
              <EditorErrorBoundary
                fallback={
                  <div
                    style={{
                      padding: "1.5rem",
                      border: "1px solid var(--danger-300)",
                      borderRadius: "6px",
                      color: "var(--danger-700)",
                    }}
                  >
                    The story editor could not be loaded. Refresh the page to try again.
                    If this keeps happening, the saved story content may be corrupted —
                    contact support with the exact error.
                  </div>
                }
              >
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  ariaLabelledBy="story-content-heading"
                />
              </EditorErrorBoundary>
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

      <div className={styles.mobileTabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "edit"}
          onClick={() => setActiveTab("edit")}
          className={`${styles.mobileTab} ${activeTab === "edit" ? styles.mobileTabActive : ""}`}
        >
          Edit
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "preview"}
          onClick={() => setActiveTab("preview")}
          className={`${styles.mobileTab} ${activeTab === "preview" ? styles.mobileTabActive : ""}`}
        >
          Preview
        </button>
      </div>
    </div>
  );
}


