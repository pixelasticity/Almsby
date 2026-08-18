"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
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
  const tr = useTranslations("auth");

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="next" value={next} />
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          {tr("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder={tr("emailPlaceholder")}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          {tr("password")}
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
        {isPending ? "…" : mode === "sign-up" ? tr("createAccount") : tr("signIn")}
      </button>
      <p className={styles.toggleRow}>
        {mode === "sign-up" ? tr("haveAccount") : tr("noAccount")}
        <Link
          href={mode === "sign-up" ? "/sign-in" : "/sign-up"}
          className={styles.toggleLink}
        >
          {mode === "sign-up" ? tr("signIn") : tr("signUp")}
        </Link>
      </p>
    </form>
  );
}
