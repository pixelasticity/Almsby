"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Link from "next/link";
import TipTapEditor from "./TipTapEditor";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import MobilePreview from "./MobilePreview";
import PassportSummary from "./PassportSummary";
import PhotoUploader from "./PhotoUploader";
import { toGtin14 } from "@/lib/gs1/gtin";
import { storyPagePath } from "@/lib/story/url";
import { saveStoryAction, publishStoryAction } from "@/app/(dashboard)/products/[id]/studio/actions";
import { toPlainJson } from "@/lib/story/plainJson";
import { optionalInput } from "@/lib/input";
import styles from "./story-studio.module.css";

type StudioProduct = {
  id: string;
  name: string;
  gtin?: { gtinValue: string } | null;
  countryOfOrigin?: string | null;
  materialComposition?: string | null;
  recyclable?: boolean | null;
  storyPage?: {
    id: string;
    published: boolean;
    bodyContent: unknown;
    headline: string | null;
    /** R2 URLs; [] when the story has none yet (and on pre-photo rows). */
    photos: string[];
  } | null;
};

export default function StoryStudio({ product }: { product: StudioProduct }) {
  const t = useTranslations("story");
  // Studio chrome (status / save / publish / tabs) has its own namespace so the
  // maker's editor copy and the public story page's copy can't be confused.
  const tStudio = useTranslations("storyStudio");
  // TipTap JSON content — stored directly in StoryPage.bodyContent.
  const [content, setContent] = useState<Record<string, unknown> | null>(
    (product.storyPage?.bodyContent as Record<string, unknown>) ?? null
  );
  // Headline — a dedicated StoryPage column, edited OUTSIDE the Tiptap doc so
  // the bounded rich-text schema (paragraph/heading/bold/italic/strike/link
  // only) stays intact per the Phase 2 brief.
  const [headline, setHeadline] = useState(product.storyPage?.headline ?? "");
  // Photo URLs. Uploading writes to R2 immediately; this array is what gets
  // persisted with the next Save/Publish (see PhotoUploader's header comment).
  const [photos, setPhotos] = useState<string[]>(product.storyPage?.photos ?? []);
  const [isPublished, setIsPublished] = useState(product.storyPage?.published ?? false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState<string | null>(null);

  // Independent pending flags so Save and Publish each give their own feedback
  // (previously they shared one flag, so a save would gray out Publish too).
  const [isSaving, startSaving] = useTransition();
  const [isPublishing, startPublishing] = useTransition();

  // Snapshot of the last successfully-persisted content, used for dirty tracking.
  const [savedContent, setSavedContent] = useState<Record<string, unknown> | null>(content);
  const [savedHeadline, setSavedHeadline] = useState(product.storyPage?.headline ?? "");
  const [savedPhotos, setSavedPhotos] = useState<string[]>(
    product.storyPage?.photos ?? []
  );
  // "idle" (nothing to report) | "saved" (brief confirmation) — errors go to the banner.
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  // Dirty = current editor content, headline, OR photo list differs from what's
  // been persisted. Photos count: an upload only becomes visible to a shopper
  // after Save, so their presence must keep this true.
  const hasUnsavedChanges =
    JSON.stringify(content) !== JSON.stringify(savedContent) ||
    headline !== savedHeadline ||
    JSON.stringify(photos) !== JSON.stringify(savedPhotos);

  // The public story page is served at `/s/{gtin14}` (see app/(public)/s/[gtin])
  // — the same path the resolver redirects a scanned barcode to. storyPagePath
  // owns the path shape (shared with the public page's canonical URL); the link
  // stays relative and domain-agnostic: it works on whatever host this
  // dashboard is served from.
  const liveUrl =
    isPublished && product.gtin?.gtinValue
      ? storyPagePath(product.gtin.gtinValue)
      : null;

  // Auto-clear the "Saved" confirmation after a moment so it never lingers stale.
  useEffect(() => {
    if (saveStatus !== "saved") return;
    const timer = setTimeout(() => setSaveStatus("idle"), 3000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  // Warn before navigating away / closing with unsaved changes (browser's native
  // prompt). Hidden from JS when consumed (e.g. a form submit we control) by the
  // browser heuristics; kept lean and torn down on save/unmount.
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);

  const handleSave = () => {
    if (isSaving) return;
    setError(null);
    setSaveStatus("idle");
    startSaving(async () => {
      // Deep-clone to plain JSON before the Server Action. React 19's Server
      // Action serializer flags deeply nested TipTap docs (headings) as
      // "temporary client references" and throws "Cannot access toStringTag on
      // the server" server-side. toPlainJson strips the markers (see lib).
      const result = await saveStoryAction(
        product.id,
        toPlainJson(content),
        optionalInput(headline),
        photos
      );
      if (result?.error) {
        setError(result.error);
        return;
      }
      // Only mark saved on success so a failed save stays "dirty".
      setSavedContent(content);
      setSavedHeadline(headline);
      setSavedPhotos(photos);
      setSaveStatus("saved");
    });
  };

  const handlePublish = () => {
    if (isPublishing) return;

    // Unpublishing takes a live, customer-facing page offline — confirm first.
    // Native confirm() is used here (consistent with the existing window.prompt()
    // link flow) and is accessible by default. Flag as a future ConfirmDialog.
    if (isPublished && !window.confirm(tStudio("confirmUnpublish"))) {
      return;
    }

    setError(null);
    startPublishing(async () => {
      const published = !isPublished;
      // Same marker-stripping as handleSave — publish also persists content
      // and headline.
      const result = await publishStoryAction(
        product.id,
        toPlainJson(content),
        optionalInput(headline),
        published,
        photos
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setIsPublished(published);
        // Publish also persists content, so clear the dirty state on success.
        setSavedContent(content);
        setSavedHeadline(headline);
        setSavedPhotos(photos);
      }
    });
  };

  return (
    <div className={styles.studio}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>{product.name}</h1>
          <p className={styles.headerSubtitle}>{tStudio("subtitle")}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            className={`${styles.status} ${isPublished ? styles.statusLive : styles.statusDraft}`}
            role="status"
            aria-label={isPublished ? tStudio("statusLabelLive") : tStudio("statusLabelDraft")}
          >
            {isPublished
              ? `● ${tStudio("statusLive")}`
              : `○ ${tStudio("statusDraft")}`}
          </span>
          {hasUnsavedChanges && (
            <span className={`${styles.status} ${styles.unsaved}`} aria-hidden="true">
              • {tStudio("unsaved")}
            </span>
          )}
          <Button
            variant="secondary"
            type="button"
            pending={isSaving}
            pendingLabel={tStudio("saving")}
            onClick={handleSave}
          >
            {tStudio("save")}
          </Button>
          {saveStatus === "saved" && (
            <span className={`${styles.status} ${styles.statusLive}`}>
              {tStudio("saved")} ✓
            </span>
          )}
          <Button
            variant={isPublished ? "secondary" : "primary"}
            type="button"
            pending={isPublishing}
            onClick={handlePublish}
          >
            {isPublished ? tStudio("unpublish") : tStudio("publish")}
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
            {/* Headline — shared FormField primitive, styled via this module's
                .field/.label/.helper/.headlineInput classes. */}
            <FormField
              styles={styles}
              htmlFor="story-headline"
              label={t("headlineLabel")}
              helper={t("headlineHelper")}
            >
              <input
                id="story-headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder={t("headlinePlaceholder")}
                className={styles.headlineInput}
                aria-describedby="story-headline-helper"
              />
            </FormField>

            <section>
              <h2 className={styles.sectionTitle} id="story-content-heading">
                {tStudio("contentHeading")}
              </h2>
              <ErrorBoundary
                name="TipTapEditor"
                fallback={
                  <div
                    style={{
                      padding: "1.5rem",
                      border: "1px solid var(--danger-300)",
                      borderRadius: "6px",
                      color: "var(--danger-700)",
                    }}
                  >
                    {tStudio("editorLoadError")}
                  </div>
                }
              >
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  ariaLabelledBy="story-content-heading"
                />
              </ErrorBoundary>
            </section>

            {/* Photos — heading + dropzone + previews. Sits after the prose so
                the writing surface stays the first thing in the panel. */}
            <PhotoUploader
              productId={product.id}
              photos={photos}
              savedPhotos={savedPhotos}
              onChange={setPhotos}
            />
          </div>
        </div>

                {/* Passport data — shown alongside the editor on wide screens,
            full-width below the editor on mobile. Shares the edit tab's visibility. */}
        <div
          className={styles.passportPanel}
          style={{ display: activeTab === "preview" ? "none" : "block" }}
        >
          <PassportSummary product={product} />
        </div>

        <div
          className={styles.previewPanel}
          style={{ display: activeTab === "edit" ? "none" : "block" }}
        >
          <div className={styles.previewInner}>
            {liveUrl && (
              <Link href={liveUrl} target="_blank" rel="noopener noreferrer" className={styles.viewLive}>
                {tStudio("viewLive")} ↗
              </Link>
            )}
            <MobilePreview
              content={content}
              headline={headline}
              isPublished={isPublished}
              photos={photos}
            />
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
          {tStudio("tabEdit")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "preview"}
          onClick={() => setActiveTab("preview")}
          className={`${styles.mobileTab} ${activeTab === "preview" ? styles.mobileTabActive : ""}`}
        >
          {tStudio("tabPreview")}
        </button>
      </div>
    </div>
  );
}


