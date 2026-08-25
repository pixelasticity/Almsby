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
  } = await supabase.auth.getUser();
  return user;
}