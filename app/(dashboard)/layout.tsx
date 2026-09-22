import { getTranslations } from "next-intl/server";
import styles from "./layout.module.css";
import Sidebar from "@/components/dashboard/Sidebar";
import Breadcrumbs from "@/components/dashboard/Breadcrumbs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("nav");
  return (
    <div className={styles.root}>
      <Sidebar />
      <div className={styles.wrap}>
        {/* Keyboard users can jump past the nav on every dashboard page. */}
        <a href="#main-content" className={styles.skipLink}>
          {t("skipToContent")}
        </a>
        <main id="main-content" className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}


