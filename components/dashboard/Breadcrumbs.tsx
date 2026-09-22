import Link from "next/link";
import { getTranslations } from "next-intl/server";
import styles from "./breadcrumbs.module.css";

/**
 * One step in a dashboard breadcrumb trail. Every label must be a translated
 * string, never a route segment — the trail is user-facing navigation, so an
 * id, slug, or raw pathname segment must never reach it.
 */
export type BreadcrumbItem = {
  /** Translated, user-facing label. */
  label: string;
  /**
   * Destination. Omitted on the final crumb (it is the current page and must
   * not be a link) and on any non-interactive step.
   */
  href?: string;
};

/**
 * Standalone breadcrumb trail for dashboard pages.
 *
 * A Server Component: the trail is static per page render, so it needs none of
 * the client-side machinery `SidebarLink` carries (interaction state, active
 * route detection). Renders nothing when `items` is empty, which is how the
 * dashboard root opts out — it is the trail's own starting point, so a trail
 * containing only "Dashboard" would be noise.
 *
 * Breadcrumbs are the *only* hierarchy affordance dashboard pages should draw.
 * Do not pair them with a separate "back to …" link: one trail that includes
 * the parent is the way back, and two competing affordances is two sources of
 * truth for the same navigation.
 *
 * Document-shaped pages only. Workspaces (Story Studio) deliberately omit the
 * trail — its own header already answers "where am I" and "how do I get back",
 * so a trail would duplicate it while shrinking the panes it exists to show.
 * Full rationale in components/dashboard/README.md.
 */
export default async function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  /** Applied to the `nav` landmark. Used by the label page to print-hide. */
  className?: string;
}) {
  if (items.length === 0) return null;
  const t = await getTranslations("nav");

  return (
    <nav
      aria-label={t("breadcrumb")}
      data-slot="breadcrumbs"
      className={className ? `${styles.crumbs} ${className}` : styles.crumbs}
    >
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.href ?? "current"}-${item.label}`}
              className={styles.item}
            >
              {/* Decorative: the delimiter is announced as punctuation-nothing
                  by AT, and the list structure already conveys the sequence. */}
              {index > 0 ? (
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                // `aria-current` is reserved for the LAST crumb. An
                // intermediate step with no href is neither a link nor the
                // current page, so it gets plain text and no ARIA state —
                // marking it current would describe the page wrongly.
                <span
                  className={isLast ? styles.current : styles.plain}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
