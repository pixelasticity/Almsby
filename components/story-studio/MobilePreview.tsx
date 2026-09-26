"use client";

import { useTranslations } from "next-intl";
import styles from "./story-studio.module.css";
import TipTapRenderer, {
  type TipTapNode,
} from "@/components/story-page/TipTapRenderer";
import ComingSoon from "@/components/story-page/ComingSoon";
import PhotoGallery from "@/components/story-page/PhotoGallery";

interface MobilePreviewProps {
  content: Record<string, unknown> | null;
  /** StoryPage.headline — rendered above the body, same slot the public
      /s/[gtin] page must use so preview and public output can't drift. */
  headline: string | null;
  isPublished: boolean;
  /** StoryPage.photos — rendered in the same slot as the public page. */
  photos: string[];
}

export default function MobilePreview({
  content,
  headline,
  isPublished,
  photos,
}: MobilePreviewProps) {
  const t = useTranslations("story");
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
        {!isPublished && (
          <ComingSoon
            title={t("comingSoonTitle")}
            body={t("comingSoonBody")}
            styles={styles}
            as="h3"
          />
        )}

        <div className={styles.storyContent}>
          {headline ? <h1 className={styles.previewHeadline}>{headline}</h1> : null}
          {/* Same PhotoGallery the public page renders, in the same slot (under
              the headline), so the preview cannot drift from what scans. */}
          <PhotoGallery
            photos={photos}
            styles={styles}
            altText={(index) => t("photoAlt", { number: index + 1 })}
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


