import DashboardNav from "@/components/dashboard/DashboardNav";
import styles from "./layout.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.root}>
      <DashboardNav />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

