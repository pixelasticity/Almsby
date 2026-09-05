/**
 * Phase 2 — client-side story wizard (#72).
 * 3-step wizard: headline → body blocks → photos.
 * Autosaves each step's fields (partial-merge server action); publish lives
 * on the final step's footer.
 */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import FormError from "@/components/ui/FormError";
import StoryStepHeadline from "@/components/story/StoryStepHeadline";
import StoryStepBlocks from "@/components/story/StoryStepBlocks";
import StoryStepPhotos from "@/components/story/StoryStepPhotos";
import { publishStoryAction, saveStoryDraftAction } from "@/app/(dashboard)/products/[id]/story/actions";
import type { StoryBlock } from "@/lib/story/queries";
import styles from "@/components/story/story.module.css";

type StoryData = {
  headline: string | null;
  bodyContent: StoryBlock[];
  photos: string[];
  published: boolean;
};

const TOTAL_STEPS = 3;

export default function StoryWizard({
  productId,
  existing,
}: {
  productId: string;
  existing: StoryData | null;
}) {
  const t = useTranslations("story");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Field state — persists across step navigation.
  const [headline, setHeadline] = useState(existing?.headline ?? "");
  const [bodyBlocks, setBodyBlocks] = useState<StoryBlock[]>(
    existing?.bodyContent ?? [{ type: "paragraph", text: "" }]
  );
  const [photos, setPhotos] = useState<string[]>(existing?.photos ?? []);

  // Auto-save a partial payload (just the current step's fields) on change.
  const autoSave = (values: {
    headline?: string | null;
    bodyContent?: StoryBlock[];
    photos?: string[];
  }) => {
    startTransition(async () => {
      setError(null);
      const result = await saveStoryDraftAction(productId, {
        headline: values.headline ?? undefined,
        bodyContent: values.bodyContent
          ? JSON.stringify(values.bodyContent)
          : undefined,
        photos: values.photos,
      });
      if (result?.error) setError(result.error);
    });
  };

  // Auto-save headline on change (debounced-ish: fires after 500ms idle).
  useEffect(() => {
    const id = setTimeout(() => {
      if (headline.trim() !== (existing?.headline ?? "")) {
        autoSave({ headline: headline.trim() || null });
      }
    }, 500);
    return () => clearTimeout(id);
  }, [headline]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handlePublish = () => {
    startTransition(async () => {
      setError(null);
      const result = await publishStoryAction(productId, {
        headline: headline.trim() || null,
        bodyContent: JSON.stringify(bodyBlocks),
        photos,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        router.push(`/products/${productId}`);
      }
    });
  };

  const stepLabel = currentStep === 1 ? "headline" : currentStep === 2 ? "blocks" : "photos";

  return (
    <div className={styles.wizard}>
      <header className={styles.header}>
        <button
          type="button"
          onClick={() => router.push(`/products/${productId}`)}
          className={styles.backLink}
        >
          ← {t("backToProduct")}
        </button>
        <h1>{existing ? t("edit") : t("create")}</h1>
        <p className={styles.stepIndicator} aria-live="polite">
          {t("stepIndicator", { current: currentStep, total: TOTAL_STEPS })}
        </p>
      </header>

      <FormError message={error} id="story-error" />

      <div className={styles.step} key={stepLabel}>
        {currentStep === 1 && (
          <StoryStepHeadline value={headline} onChange={setHeadline} required />
        )}
        {currentStep === 2 && (
          <StoryStepBlocks
            blocks={bodyBlocks}
                        onChange={setBodyBlocks}
            onAutoSave={(blocks) => autoSave({ bodyContent: blocks })}
          />
        )}
        {currentStep === 3 && (
          <StoryStepPhotos
            productId={productId}
            photos={photos}
            onChange={setPhotos}
            onAutoSave={(updated) => autoSave({ photos: updated })}
          />
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.nav}>
          {currentStep > 1 && (
            <button type="button" onClick={goBack} className={styles.secondaryBtn}>
              ← {t("back")}
            </button>
          )}
          {currentStep < TOTAL_STEPS ? (
            <button type="button" onClick={goNext} className={styles.primaryBtn}>
              {t("next")} →
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPending}
              className={styles.primaryBtn}
            >
              {isPending ? t("publishing") : t("publish")}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
