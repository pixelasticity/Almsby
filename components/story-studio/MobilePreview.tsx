"use client";

import { useTranslations } from "next-intl";
import styles from "./story-studio.module.css";
import TipTapRenderer, {
  type TipTapNode,
} from "@/components/story-page/TipTapRenderer";
import PhotoGallery from "@/components/story-page/PhotoGallery";
import type { StoryPhoto } from "@/lib/story/photos";

interface MobilePreviewProps {
  content: Record<string, unknown> | null;
  /** StoryPage.headline — rendered above the body, same slot the public
      /s/[gtin] page must use so preview and public output can't drift. */
  headline: string | null;
  isPublished: boolean;
  /** StoryPage.photos — rendered in the same slot as the public page. */
  photos: StoryPhoto[];
}

export default function MobilePreview({
  content,
  headline,
  isPublished,
  photos,
}: MobilePreviewProps) {
  const t = useTranslations("story");
  const tStudio = useTranslations("storyStudio");
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
        {/* Draft state is a NOTICE, not a replacement. The preview's job is to
            show the maker the layout they are building — swapping the whole
            frame for the coming-soon placeholder (which is every unpublished
            story, i.e. every story while it is being written) made the preview
            useless exactly when it was needed. What shoppers currently see is
            still stated, and the real coming-soon screen remains the public
            page's own behavior. */}
        {!isPublished ? (
          <p className={styles.previewDraftNotice}>{tStudio("previewDraftNotice")}</p>
        ) : null}

        <div className={styles.storyContent}>
          {headline ? <h1 className={styles.previewHeadline}>{headline}</h1> : null}
          {/* Same PhotoGallery the public page renders, in the same slot (under
              the headline), so the preview cannot drift from what scans. */}
          <PhotoGallery
            photos={photos}
            styles={styles}
            roleLabel={(role) => t(`photoRoles.${role}`)}
            altFallback={(index) => t("photoAlt", { number: index + 1 })}
          />
          {nodes.length === 0 ? (
            <div className={styles.blocksEmpty}>
              <p>{t("emptyHint")}</p>
            </div>
          ) : (
            <TipTapRenderer content={nodes} />
          )}
        </div>
      </div>
    </div>
  );
}


