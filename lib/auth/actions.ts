"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { env } from "@/lib/env";

export type AuthState = { error?: string };

export async function signUpAction(
  _prev: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: env.appUrl },
  });

  if (error) return { error: error.message };
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

  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(
    { email, password }
  );

  if (error) return { error: "Invalid email or password." };

  redirect(safeNext);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
