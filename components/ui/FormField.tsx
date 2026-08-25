import type { ReactNode } from "react";

/**
 * The label → input → helper block shared by every form.
 *
 * Styling is intentionally NOT centralized: each form's CSS module tunes
 * gap/weight slightly (e.g. AuthForm vs ProductForm), so callers pass their
 * own CSS module and rendered markup/classes stay identical to the
 * pre-refactor forms. Expected class names: `field`, `label`, plus optional
 * `badge` and `helper`. The helper paragraph gets the stable id
 * `${htmlFor}-helper` so inputs can `aria-describedby` it (WCAG 3.3.2).
 */
type CssModule = { readonly [key: string]: string };

export default function FormField({
  styles,
  htmlFor,
  label,
  badge,
  helper,
  children,
}: {
  /** The caller's CSS module providing .field/.label/.badge/.helper. */
  styles: CssModule;
  htmlFor: string;
  label: ReactNode;
  badge?: ReactNode;
  helper?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </label>
      {children}
      {helper ? (
        <p id={`${htmlFor}-helper`} className={styles.helper}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}
