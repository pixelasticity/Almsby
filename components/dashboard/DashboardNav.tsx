import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";
import { getTranslations } from "next-intl/server";
import styles from "@/app/(dashboard)/layout.module.css";

/** Maker dashboard top bar: brand, primary nav links, sign-out. */
export default async function DashboardNav() {
  const t = await getTranslations("nav");
  return (
    <header className={styles.header}>
      <strong className={styles.brand}>Almsby</strong>
      <nav className={styles.nav}>
        <Link href="/dashboard">{t("dashboard")}</Link>
        <Link href="/products">{t("products")}</Link>
        <Link href="/settings">{t("settings")}</Link>
        <form action={signOutAction}>
          <button type="submit" className={styles.signOut}>
            {t("signOut")}
          </button>
        </form>
      </nav>
    </header>
  );
}
