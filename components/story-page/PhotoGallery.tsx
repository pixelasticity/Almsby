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
 *   .photos (grid)  .photo (cell)  .photoHero (first cell, spans the row)
 *   .photoFrame (crop box)  .photoImg (the image)
 *   .photoRole (role badge)  .photoCaption (caption line)
 */
import { photoAltText, type PhotoRole, type StoryPhoto } from "@/lib/story/photos";

type CssModule = { readonly [key: string]: string };

type PhotoGalleryProps = {
  /** Structured photos, normalized on the way in (lib/story/photos.ts). */
  photos: StoryPhoto[];
  /** The caller's CSS module providing the classes documented above. */
  styles: CssModule;
  /** Translated label for a role, e.g. "Process". */
  roleLabel: (role: PhotoRole) => string;
  /** Translated alt fallback for a photo with neither caption nor role. */
  altFallback: (index: number) => string;
};

export default function PhotoGallery({
  photos,
  styles,
  roleLabel,
  altFallback,
}: PhotoGalleryProps) {
  // Render nothing at all when there are no photos — an empty grid would leave
  // a gap in the story, and the caller's layout already handles the no-photo case.
  if (photos.length === 0) return null;

  return (
    <ul className={styles.photos}>
      {photos.map((photo, index) => {
        // Position IS the cover choice: the first photo leads the story. Keeping
        // it positional avoids an `isCover` flag that could fall out of sync with
        // the array it describes — "Make cover" in the studio just moves a photo
        // to the front.
        const isCover = index === 0;
        return (
          <li
            key={photo.url}
            className={`${styles.photo} ${isCover ? styles.photoHero : ""}`}
          >
            <div className={styles.photoFrame}>
              <img
                src={photo.url}
                // Most specific description available: the maker's caption, else
                // the role they chose, else a generic label.
                alt={photoAltText(
                  photo,
                  photo.role ? roleLabel(photo.role) : undefined,
                  altFallback(index)
                )}
                className={styles.photoImg}
                loading={isCover ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
            {photo.role ? (
              <p className={styles.photoRole}>{roleLabel(photo.role)}</p>
            ) : null}
            {photo.caption ? (
              <p className={styles.photoCaption}>{photo.caption}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
