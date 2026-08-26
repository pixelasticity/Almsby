"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import styles from "./error.module.css";

/**
 * Route-segment error boundary (client by Next requirement). Catches render
 * and data failures in any route group; logs for server visibility.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("errorTitle")}</h1>
        <p className={styles.body}>{t("errorBody")}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.cta} onClick={() => reset()}>
            {t("errorRetry")}
          </button>
          <Link href="/" className={styles.link}>
            almsby.io
          </Link>
        </div>
      </div>
    </main>
  );
}
