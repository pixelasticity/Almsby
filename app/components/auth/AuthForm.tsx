"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction } from "@/lib/auth/actions";
import styles from "./AuthForm.module.css";

export default function AuthForm({
  mode,
  next = "/dashboard",
  message,
}: {
  mode: "sign-in" | "sign-up";
  next?: string;
  message?: string;
}) {
  const action = mode === "sign-up" ? signUpAction : signInAction;
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="next" value={next} />
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          className={styles.input}
        />
      </div>
      {message && <p className={styles.message}>{message}</p>}
      {state?.error && <p className={styles.error}>{state.error}</p>}
      <button type="submit" disabled={isPending} className={styles.submit}>
        {isPending ? "…" : mode === "sign-up" ? "Create account" : "Sign in"}
      </button>
      <p className={styles.toggleRow}>
        {mode === "sign-up" ? "Already have an account? " : "No account yet? "}
        <Link
          href={mode === "sign-up" ? "/sign-in" : "/sign-up"}
          className={styles.toggleLink}
        >
          {mode === "sign-up" ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </form>
  );
}
