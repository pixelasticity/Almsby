"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import styles from "@/styles/landing.module.css";

// Phase 0: visual-only waitlist form - no backend yet. Validates the email
// locally and shows a local confirmation; wire to a Supabase early_access
// table (server action) before launch.
export default function WaitlistForm() {
  const tr = useTranslations("waitlist");
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(tr("error"));
      return;
    }
    setError("");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.formSuccess}>
        <span className={styles.checkBadge}>
          <CheckIcon />
        </span>
        {tr("success")}
      </div>
    );
  }
  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div
        className={styles.inputWrap}
        style={
          error
            ? { borderColor: "#ef4444" }
            : focused
              ? { borderColor: "#16a34a", boxShadow: "0 0 0 3px rgba(22,163,74,0.12)" }
              : undefined
        }
      >
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={tr("emailPlaceholder")}
          aria-label={tr("emailLabel")}
        />
      </div>
      <button type="submit" className={styles.formButton}>
        <span>{tr("submit")}</span>
        <ArrowRightIcon />
      </button>
      <p className={styles.formHelper}>
        {tr("helper")}
      </p>
      {error && <p className={styles.formError}>{error}</p>}
    </form>
  );
}
