import AuthForm from "@/components/auth/AuthForm";
import styles from "./page.module.css";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("signUpTitle") };
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message, next } = await searchParams;
  const t = await getTranslations("auth");
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1>{t("signUpTitle")}</h1>
        <AuthForm mode="sign-up" next={next} message={message} />
      </div>
    </main>
  );
}
