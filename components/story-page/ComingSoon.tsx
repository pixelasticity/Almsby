/**
 * The shared "coming soon" block.
 *
 * Used by BOTH the public story page (/s/[gtin]) and the studio's mobile
 * preview — which is the whole point: the preview exists to show the maker
 * "what scans", so the unpublished state must be one implementation, not two
 * that drift.
 *
 * Presentational only — no hooks, no translation calls, so it is importable
 * from a Server Component AND a client tree. Callers pass already-translated
 * copy and their own CSS module (same `styles`-prop convention as FormField).
 *
 * Expected class names in the caller's CSS module:
 *   .comingSoon  .comingSoonIcon  .comingSoonTitle  .comingSoonBody
 */

type CssModule = { readonly [key: string]: string };

type ComingSoonProps = {
  /** Already-translated copy (story.comingSoonTitle / story.comingSoonBody). */
  title: string;
  body: string;
  /** The caller's CSS module providing the four classes documented above. */
  styles: CssModule;
  /** Heading level: h1 standalone (public page), h3 inside the preview frame. */
  as?: "h1" | "h3";
};

export default function ComingSoon({
  title,
  body,
  styles,
  as: Heading = "h1",
}: ComingSoonProps) {
  return (
    <div className={styles.comingSoon}>
      <div className={styles.comingSoonIcon} aria-hidden="true">
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <Heading className={styles.comingSoonTitle}>{title}</Heading>
      <p className={styles.comingSoonBody}>{body}</p>
    </div>
  );
}
