import styles from "./story-studio.module.css";
import TipTapRenderer, {
  type TipTapNode,
} from "@/components/story-page/TipTapRenderer";

interface MobilePreviewProps {
  content: Record<string, unknown> | null;
  isPublished: boolean;
}

export default function MobilePreview({ content, isPublished }: MobilePreviewProps) {
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

        <div className={styles.storyContent}>
          {nodes.length === 0 ? (
            <div className={styles.blocksEmpty}>
              <p>Start adding blocks to see the story unfold...</p>
            </div>
          ) : (
            <TipTapRenderer content={nodes} />
          )}
        </div>
      </div>
    </div>
  );
}


