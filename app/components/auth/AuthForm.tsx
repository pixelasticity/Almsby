"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction } from "@/lib/auth/actions";
const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 15,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  display: "block",
  marginBottom: 6,
};
const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

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
    <form
      action={formAction}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <input type="hidden" name="next" value={next} />
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          style={inputStyle}
        />
      </div>
      {message && <p style={{ fontSize: 13, color: "#374151" }}>{message}</p>}
      {state?.error && (
        <p style={{ fontSize: 13, color: "#b91c1c" }}>{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #d1d5db",
          background: "#111827",
          color: "#ffffff",
          fontSize: 15,
          cursor: isPending ? "default" : "pointer",
        }}
      >
        {isPending ? "…" : mode === "sign-up" ? "Create account" : "Sign in"}
            </button>
      <p style={{ fontSize: 13, marginTop: 8 }}>
        {mode === "sign-up" ? "Already have an account? " : "No account yet? "}
        <Link
          href={mode === "sign-up" ? "/sign-in" : "/sign-up"}
          style={{ color: "#2563eb", textDecoration: "underline", marginLeft: 4 }}
        >
          {mode === "sign-up" ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </form>
  );
}
