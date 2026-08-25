import { getTranslations } from "next-intl/server";
import DashboardNav from "@/components/dashboard/DashboardNav";
import styles from "./layout.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("nav");
  return (
    <div className={styles.root}>
      {/* Keyboard users can jump past the nav on every dashboard page. */}
      <a href="#main-content" className={styles.skipLink}>
        {t("skipToContent")}
      </a>
      <DashboardNav />
      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </div>
  );
}


