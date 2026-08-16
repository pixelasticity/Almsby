"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

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
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Account could not be created." };
  const user = data.user;

  // Phase 0 DoD: sign up -> create a Business (and one empty Product under it)
  // on the Almsby DB, keyed to the new auth user. This works whether or not
  // email confirmation is required, since supabase.auth.signUp returns the
  // user once the account exists, even before a session is established.
  try {
    const db = getDb();
    await db.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: { ownerId: user.id, name: email },
      });
      await tx.product.create({
        data: { businessId: business.id, name: "Untitled product" },
      });
    });
  } catch (e) {
    console.error("Failed to create Business for user:", user.id, e);
    return {
      error:
        "Your account was created, but we couldn't set up your workspace. " +
        "Sign in again, or contact support if the problem persists.",
    };
  }

  if (!data.session) {
    redirect(`/sign-in?message=${encodeURIComponent(
      "Check your email to confirm your account, then sign in.")}`);
  }
  redirect("/dashboard");
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
