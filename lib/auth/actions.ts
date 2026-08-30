"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { isValidEmail } from "@/lib/input";
import { env } from "@/lib/env";
import { toErrorMessage } from "@/lib/errors";

export type AuthState = { error?: string };

/** Stable user-facing copy when sign-up's upstream error is opaque or missing. */
const SIGN_UP_FAILED =
  "Sign-up failed. The email step errored — check the SMTP provider settings, then try again.";

type SignUpResult = Awaited<
  ReturnType<
    Awaited<ReturnType<typeof createServerSupabaseClient>>["auth"]["signUp"]
  >
>;

export async function signUpAction(
  _prev: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  // Fail-loud, never a swallowed error or an opaque "{}": log the ORIGINAL
  // upstream error (misconfigured SMTP, provider outage, fetch failure) for
  // support, then surface a real message — or a stable fallback pointing at
  // the likely cause — to the user. The redirects below stay OUTSIDE this try
  // so NEXT_REDIRECT is never caught.
  let result: SignUpResult;
  try {
    const supabase = await createServerSupabaseClient();
    result = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: env.appUrl },
    });
  } catch (error) {
    console.error("[auth] signUp errored:", error);
    return { error: toErrorMessage(error, SIGN_UP_FAILED) };
  }

  const { data, error } = result;
  if (error) {
    console.error("[auth] signUp failed:", error);
    return { error: toErrorMessage(error, SIGN_UP_FAILED) };
  }
  if (!data.user) return { error: "Account could not be created." };

  // Phase 1 (business onboarding): the account is created, but the Business is
  // set up explicitly by the maker on /business/onboarding (name, industry,
  // country, currency). We no longer auto-create a Business + empty Product here
  // — that was the Phase 0 silent scaffold and caused the stranded-workspace bug.

  if (!data.session) {
    redirect(`/sign-in?message=${encodeURIComponent(
      "Check your email to confirm your account, then sign in.")}`);
  }
  redirect("/business/onboarding");
}

export async function signInAction(
  _prev: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const safeNext = sanitizeRedirectPath(next);

  // Same fail-loud discipline as signUp: log the original error, never swallow.
  // The USER-VISIBLE message stays deliberately generic in both paths — no user
  // enumeration (don't confirm which credential was wrong), and no leaking of
  // transport/provider details into the sign-in form. The redirect lives
  // outside the try so NEXT_REDIRECT isn't caught.
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(
      { email, password }
    );
    if (error) {
      console.error("[auth] signIn failed:", error);
      return { error: "Invalid email or password." };
    }
  } catch (error) {
    console.error("[auth] signIn errored:", error);
    return { error: "Sign-in failed. Please try again." };
  }

  redirect(safeNext);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
