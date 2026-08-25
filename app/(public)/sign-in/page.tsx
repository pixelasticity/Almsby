import AuthForm from "@/components/auth/AuthForm";
import styles from "./page.module.css";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("signInTitle") };
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message, next } = await searchParams;
  const t = await getTranslations("auth");
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1>{t("signInTitle")}</h1>
        <AuthForm mode="sign-in" next={next} message={message} />
      </div>
    </main>
  );
}
