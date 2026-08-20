import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import BusinessOnboardingForm from "@/components/business/BusinessOnboardingForm";
import styles from "./page.module.css";

export default async function BusinessOnboardingPage() {
  const user = await getCurrentUser();

  if (user) {
    try {
      const db = getDb();
      const existing = await db.business.findFirst({
        where: { ownerId: user.id },
      });
      // Returning user who already set up a business — skip onboarding.
      if (existing) redirect("/dashboard");
    } catch (error) {
      console.error("BusinessOnboardingPage: db check failed", error);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <BusinessOnboardingForm />
      </div>
    </main>
  );
}