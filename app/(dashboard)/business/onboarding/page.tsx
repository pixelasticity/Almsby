import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getOwnedBusiness } from "@/lib/products/queries";
import BusinessOnboardingForm from "@/components/business/BusinessOnboardingForm";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business");
  return { title: t("creation.metaTitle") };
}

export default async function BusinessOnboardingPage() {
  const user = await getCurrentUser();

  let hasBusiness = false;
  if (user) {
    try {
      const existing = await getOwnedBusiness(user.id);
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