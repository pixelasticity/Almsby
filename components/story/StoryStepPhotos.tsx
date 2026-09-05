/**
 * Step 3 of the story CMS wizard (#72): photo upload + grid.
 * Validates file type/size client-side (instant feedback via validatePhotoFile),
 * then uploads via a server action (R2 credentials are server-only — never
 * exposed to the browser). Each uploaded file becomes a public URL added to
 * the parent's `photos` array, then auto-saved via onAutoSave.
 */
"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import FormField from "@/components/ui/FormField";
import FormError from "@/components/ui/FormError";
import { validatePhotoFile } from "@/lib/story/storage";
import { uploadStoryPhotoAction } from "@/app/(dashboard)/products/[id]/story/actions";
import styles from "./story.module.css";

export default function StoryStepPhotos({
  productId,
  photos,
  onChange,
  onAutoSave,
}: {
  productId: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  onAutoSave: (photos: string[]) => void;
}) {
  const t = useTranslations("story.stepPhotos");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setError(null);
    startTransition(async () => {
      const newUrls: string[] = [];
      try {
        for (const file of files) {
          const bytes = new Uint8Array(await file.arrayBuffer());
          // validatePhotoFile throws on bad type/size — fail loud (AGENTS.md rule #1)
          const validated = validatePhotoFile({
            bytes,
            filename: file.name,
            contentType: file.type,
          });
          // Upload via server action (R2 creds are server-only).
          const url = await uploadStoryPhotoAction(productId, validated);
          newUrls.push(url);
        }
        const updated = [...photos, ...newUrls];
        onChange(updated);
        onAutoSave(updated);
      } catch (err) {
        // validatePhotoFile, uploadStoryPhotoAction both throw Error with
        // user-readable messages; anything else gets a safe fallback.
        setError(
          err instanceof Error
            ? err.message
            : "Could not upload the photo. Please try again."
        );
      }
    });
  };

  const removePhoto = (url: string) => {
    const updated = photos.filter((p) => p !== url);
    onChange(updated);
    onAutoSave(updated);
  };

  return (
    <div className={styles.photosStep}>
      <FormField styles={styles} htmlFor="story-photos" label={t("label")} helper={t("helper")}>
        <div id="story-photos">
          <label className={styles.uploadBtn} htmlFor="photo-input">
            {isPending ? "…" : t("upload")}
          </label>
          <input
            id="photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple
            onChange={handleUpload}
            disabled={isPending}
            className={styles.hiddenInput}
            aria-label={t("upload")}
          />
        </div>
      </FormField>

      <FormError message={error} id="photo-error" />

      {photos.length === 0 ? (
        <p className={styles.muted}>{t("empty")}</p>
      ) : (
        <ul className={styles.photoGrid}>
          {photos.map((url) => (
            <li key={url} className={styles.photoItem}>
              <img src={url} alt="" className={styles.photo} loading="lazy" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className={styles.removeBtn}
                title={t("remove")}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
