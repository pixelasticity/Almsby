"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signInAction, signUpAction } from "@/lib/auth/actions";
import FormError from "@/components/ui/FormError";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
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
  const [state, formAction] = useActionState(action, undefined);
  const tr = useTranslations("auth");

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="next" value={next} />
      <FormField styles={styles} htmlFor="email" label={tr("email")}>
        <input
          id="email"
          name="email"
          type="email"
          placeholder={tr("emailPlaceholder")}
          required
          className={styles.input}
        />
      </FormField>
      <FormField styles={styles} htmlFor="password" label={tr("password")}>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          className={styles.input}
        />
      </FormField>
      {message && <p className={styles.message}>{message}</p>}
      <FormError message={state?.error} className={styles.error} />
      <SubmitButton className={styles.submit}>
        {mode === "sign-up" ? tr("createAccount") : tr("signIn")}
      </SubmitButton>
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

