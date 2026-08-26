import Link from "next/link";
import { getTranslations } from "next-intl/server";
import styles from "./not-found.module.css";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code} aria-hidden="true">
          404
        </p>
        <h1 className={styles.title}>{t("notFoundTitle")}</h1>
        <p className={styles.body}>{t("notFoundBody")}</p>
        <Link href="/" className={styles.cta}>
          {t("notFoundCta")}
        </Link>
      </div>
    </main>
  );
}
