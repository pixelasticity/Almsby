import AuthForm from "@/components/auth/AuthForm";
import styles from "./page.module.css";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message, next } = await searchParams;
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1>Sign in</h1>
        <AuthForm mode="sign-in" next={next} message={message} />
      </div>
    </main>
  );
}
