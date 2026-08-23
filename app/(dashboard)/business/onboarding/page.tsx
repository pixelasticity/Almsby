import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import BusinessOnboardingForm from "@/components/business/BusinessOnboardingForm";
import styles from "./page.module.css";

export default async function BusinessOnboardingPage() {
  const user = await getCurrentUser();

  let hasBusiness = false;
  if (user) {
    try {
      const db = getDb();
      const existing = await db.business.findFirst({
        where: { ownerId: user.id },
      });
      hasBusiness = Boolean(existing);
    } catch (error) {
      console.error("BusinessOnboardingPage: db check failed", error);
      return (
        <main className={styles.page}>
          <div className={styles.wrap}>
            <p className={styles.error}>
              Could not check your workspace. Please refresh or try again.
            </p>
          </div>
        </main>
      );
    }
  }

  // Redirect AFTER any try/catch so the NEXT_REDIRECT isn't swallowed.
  if (hasBusiness) redirect("/dashboard");

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <BusinessOnboardingForm />
      </div>
    </main>
  );
}