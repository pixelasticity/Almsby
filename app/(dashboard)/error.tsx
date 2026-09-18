"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { env } from "@/lib/env";
// Reuses the root error card styles — same visual language, same actions.
import styles from "../error.module.css";

/**
 * Dashboard-segment error boundary. Without it, a data failure on any
 * dashboard page (e.g. the studio's ownership query) bubbles to the root
 * boundary and unmounts the nav along with the page — stranding the user.
 * Scoping here keeps the dashboard shell rendered, with retry + escape hatch.
 * i18n keys are shared with the root boundary ("errors" namespace).
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("errorTitle")}</h1>
        <p className={styles.body}>{t("errorBody")}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.cta} onClick={() => reset()}>
            {t("errorRetry")}
          </button>
          <Link href={env.appUrl} className={styles.link}>
            {t("notFoundCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}