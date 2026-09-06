import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createCookieBoundSupabaseClient } from "@/lib/auth/supabase-cookie-client";

/**
 * Server-side Supabase client bound to the request's cookies.
 * Async — Next.js `cookies()` is async in Next 15+.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createCookieBoundSupabaseClient(
    () => cookieStore.getAll(),
    (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch {
        // Called from a Server Component — auth cookie writes must happen
        // in a Server Action / Route Handler, so ignore here.
      }
    }
  );
}

/** Returns the signed-in user, or null. Safe to call from any Server Component. */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // Auth failure (expired token, invalid JWT, refresh rejection) — log it
    // so it's visible to support instead of silently degrading to "no user"
    // (AGENTS.md rule #1). Callers that only need "signed in or not" keep
    // working unchanged; the reason is now in the logs.
    console.error("getCurrentUser: auth check failed", error.message);
  }

  return user;
}

/**
 * Auth guard for dashboard surfaces — the single source of truth for
 * "this code must not run without a session" (#83).
 *
 * Difference from getCurrentUser(): a missing or failing session redirects
 * to /sign-in instead of returning null, so an expired session can never
 * render the dashboard half-alive (page renders, action fails).
 *
 * Works in both contexts because Next.js supports redirect() from Server
 * Components and Server Actions alike. API-style endpoints (e.g. the label
 * PNG route) intentionally use getCurrentUser + 401 instead — a redirect
 * would make an <img>/download request render sign-in HTML.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}