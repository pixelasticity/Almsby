import AuthForm from "@/components/auth/AuthForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message, next } = await searchParams;
  return (
    <main style={{ padding: 48, maxWidth: 420, margin: "0 auto" }}>
      <h1>Sign in</h1>
      <AuthForm mode="sign-in" next={next} message={message} />
    </main>
  );
}
