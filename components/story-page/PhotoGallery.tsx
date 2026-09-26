/**
 * Read-only photo gallery for a story page.
 *
 * Used by BOTH the public /s/[gtin] page and the studio's mobile preview — the
 * same reason ComingSoon is shared: the preview exists to show the maker "what
 * scans", so the gallery must be one implementation, not two that drift.
 *
 * Presentational only — no hooks, no translation calls, so it is importable
 * from a Server Component AND a client tree. Callers pass their own CSS module
 * (the FormField/ComingSoon `styles`-prop convention) and an `altText` function,
 * because alt copy needs translating and this component has no locale of its own.
 *
 * Expected class names in the caller's CSS module:
 *   .photos  (the grid)  .photo  (a cell)  .photoImg  (the image)
 */
type CssModule = { readonly [key: string]: string };

type PhotoGalleryProps = {
  /** R2 URLs, already validated on the write path (lib/story/photos.ts). */
  photos: string[];
  /** The caller's CSS module providing the three classes documented above. */
  styles: CssModule;
  /** Translated alt text for the photo at `index` (0-based). */
  altText: (index: number) => string;
};

export default function PhotoGallery({ photos, styles, altText }: PhotoGalleryProps) {
  // Render nothing at all when there are no photos — an empty grid would leave
  // a gap in the story, and the caller's layout already handles the no-photo case.
  if (photos.length === 0) return null;

  return (
    <ul className={styles.photos}>
      {photos.map((src, index) => (
        <li key={src} className={styles.photo}>
          <img
            src={src}
            alt={altText(index)}
            className={styles.photoImg}
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  );
}
