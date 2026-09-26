"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { uploadStoryPhotoAction } from "@/app/(dashboard)/products/[id]/studio/actions";
import {
  compressPhotoIfNeeded,
  isAcceptableSource,
} from "@/lib/story/clientCompress";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_STORY_PHOTOS,
} from "@/lib/story/photoTypes";
import styles from "./story-studio.module.css";

/**
 * Drag-and-drop photo uploader for the story page.
 *
 * UPLOAD-ON-SELECT, PERSIST-ON-SAVE (deliberate): each photo is compressed in
 * the browser and written to R2 as soon as it is chosen, so the maker sees the
 * real stored image immediately — but the URL lands in StoryPage.photos on the
 * next Save/Publish, exactly like headline and body text. Nothing about the
 * page changes for a shopper until the maker saves, and the studio's existing
 * unsaved-changes indicator is what tells them so (this component adds a
 * photo-specific note for the same reason).
 *
 * Validation is duplicated ON PURPOSE: this component gives instant, specific
 * feedback (which file, which rule), and the server re-checks everything
 * (type/size in lib/story/storage.ts, URL origin in lib/story/photos.ts).
 * Client-side checks are UX, never the trust boundary.
 */
type PhotoUploaderProps = {
  productId: string;
  /** Current (possibly unsaved) photo URLs held by StoryStudio. */
  photos: string[];
  /** Last persisted URLs — drives the "not saved yet" note. */
  savedPhotos: string[];
  /**
   * Receives an updater rather than a finished array: uploads resolve
   * asynchronously, so the append must apply to the LATEST list (a removal made
   * while an upload is in flight must not be undone by a late append). StoryStudio
   * passes its setState directly.
   */
  onChange: (updater: (previous: string[]) => string[]) => void;
};

type PendingUpload = { id: number; name: string };
type UploadFailure = { id: number; message: string };

export default function PhotoUploader({
  productId,
  photos,
  savedPhotos,
  onChange,
}: PhotoUploaderProps) {
  const tStudio = useTranslations("storyStudio");
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  const [isDragOver, setIsDragOver] = useState(false);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [failures, setFailures] = useState<UploadFailure[]>([]);

  const photosChanged =
    photos.length !== savedPhotos.length ||
    photos.some((url, index) => url !== savedPhotos[index]);

  async function handleFiles(list: FileList | null) {
    const selected = Array.from(list ?? []);
    if (selected.length === 0) return;

    // Room is computed once, up front, against the cap the server also enforces.
    const room = Math.max(0, MAX_STORY_PHOTOS - photos.length - pending.length);
    const accepted: File[] = [];
    const rejected: UploadFailure[] = [];

    for (const file of selected) {
      if (!isAcceptableSource(file)) {
        rejected.push({
          id: nextId.current++,
          message: ALLOWED_PHOTO_TYPES.has(file.type)
            ? tStudio("photosTooLarge", { name: file.name })
            : tStudio("photosUnsupported", { name: file.name }),
        });
        continue;
      }
      if (accepted.length >= room) {
        rejected.push({
          id: nextId.current++,
          message: tStudio("photosMaxReached", { max: MAX_STORY_PHOTOS }),
        });
        continue;
      }
      accepted.push(file);
    }

    setFailures(rejected);
    if (accepted.length === 0) return;

    const entries = accepted.map((file) => ({
      id: nextId.current++,
      name: file.name,
    }));
    setPending((prev) => [...prev, ...entries]);

    // Sequential on purpose: one decode + one upload at a time keeps memory
    // sane on a phone and avoids a burst of concurrent writes to R2.
    for (let index = 0; index < accepted.length; index += 1) {
      const file = accepted[index];
      const entry = entries[index];
      try {
        const { file: upload } = await compressPhotoIfNeeded(file);
        const body = new FormData();
        body.append("file", upload);
        const result = await uploadStoryPhotoAction(productId, body);
        if (result.ok) {
          onChange((previous) => [...previous, result.url]);
        } else {
          setFailures((prev) => [
            ...prev,
            { id: entry.id, message: result.error },
          ]);
        }
      } catch (error) {
        // Transport-level failure (offline, expired session). Never silent:
        // the original error is logged and the maker is told which file failed.
        console.error(
          `PhotoUploader: upload of ${file.name} failed (product ${productId})`,
          error
        );
        setFailures((prev) => [
          ...prev,
          {
            id: entry.id,
            message: tStudio("photosUploadFailed", { name: file.name }),
          },
        ]);
      } finally {
        setPending((prev) => prev.filter((item) => item.id !== entry.id));
      }
    }
  }

  return (
    <section className={styles.photosSection} aria-labelledby="story-photos-heading">
      <div className={styles.photosHeader}>
        <h2 className={styles.sectionTitle} id="story-photos-heading">
          {tStudio("photosHeading")}
        </h2>
        {/* Upload progress / count — only once there is something to count. */}
        {pending.length > 0 || photos.length > 0 ? (
          <span className={styles.photosCount} role="status" aria-live="polite">
            {pending.length > 0
              ? tStudio("photosUploadingCount", { count: pending.length })
              : tStudio("photosCount", { count: photos.length })}
          </span>
        ) : null}
      </div>
      <p className={styles.photosHelper} id="story-photos-hint">
        {tStudio("photosHelper")}
      </p>

      {/* The dropzone. The input stays out of the tab order (the button is the
          labelled control), so keyboard users get one clean stop. */}
      <div
        className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          void handleFiles(event.dataTransfer?.files ?? null);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={Array.from(ALLOWED_PHOTO_TYPES).join(",")}
          className={styles.fileInput}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            void handleFiles(event.target.files);
            // Reset so choosing the same file twice still fires onChange.
            event.target.value = "";
          }}
        />
        <button
          type="button"
          className={styles.dropzoneButton}
          onClick={() => inputRef.current?.click()}
          aria-describedby="story-photos-hint"
        >
          <span className={styles.dropzoneIcon} aria-hidden="true">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              />
            </svg>
          </span>
          <span className={styles.dropzoneTitle}>{tStudio("photosDropPrompt")}</span>
          <span className={styles.dropzoneBrowse}>{tStudio("photosBrowse")}</span>
        </button>
        <p className={styles.dropzoneHint}>{tStudio("photosTypes")}</p>
      </div>

      {/* Failures are listed, never swallowed (AGENTS rule 1). */}
      {failures.length > 0 ? (
        <ul className={styles.photosErrors} role="alert">
          {failures.map((failure) => (
            <li key={failure.id}>{failure.message}</li>
          ))}
        </ul>
      ) : null}

      {photos.length > 0 || pending.length > 0 ? (
        <ul className={styles.uploadGrid}>
          {photos.map((url, index) => (
            <li key={url} className={styles.uploadTile}>
              <img
                src={url}
                alt={tStudio("photosTileAlt", { number: index + 1 })}
                className={styles.uploadTileImg}
              />
              <Button
                variant="ghost"
                className={styles.uploadRemove}
                onClick={() => onChange((previous) => previous.filter((item) => item !== url))}
                aria-label={`${tStudio("photosRemove")} ${index + 1}`}
                title={tStudio("photosRemove")}
              >
                ×
              </Button>
            </li>
          ))}
          {pending.map((item) => (
            <li
              key={item.id}
              className={`${styles.uploadTile} ${styles.uploadTilePending}`}
            >
              <span className={styles.uploadSpinner} aria-hidden="true" />
            </li>
          ))}
        </ul>
      ) : null}

      {photosChanged ? (
        <p className={styles.photosNote}>{tStudio("photosUnsaved")}</p>
      ) : null}
    </section>
  );
}
