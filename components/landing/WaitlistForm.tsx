"use client";

import { useState } from "react";
import styles from "@/styles/landing.module.css";

// Phase 0: visual-only waitlist form - no backend yet. Validates the email
// locally and shows a local confirmation; wire to a Supabase early_access
// table (server action) before launch.
export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email to get early access.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.formSuccess}>
        <span className={styles.checkBadge}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        You&apos;re in! We&apos;ll reach out before launch.
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
          placeholder="your@email.com"
          aria-label="Email"
        />
      </div>
      <button type="submit" className={styles.formButton}>
        <span>Get Early Access</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14" strokeLinecap="round" />
          <path d="M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <p className={styles.formHelper}>
        Launching December 2026 — early access includes a launch discount. No spam, ever.
      </p>
      {error && <p className={styles.formError}>{error}</p>}
    </form>
  );
}
