import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { env } from "@/lib/env";

type CookiesToSet = { name: string; value: string; options: CookieOptions }[];

/**
 * Single factory for request-scoped Supabase auth clients. Callers supply
 * only the cookie read/write adapters for their execution context — proxy
 * request (@/proxy.ts), Server Component cookie store (lib/auth/server), or
 * Route Handler response (app/(public)/auth/confirm) — instead of repeating
 * the createServerClient boilerplate in each place.
 */
export function createCookieBoundSupabaseClient(
  getAll: () => { name: string; value: string }[],
  setAll: (cookiesToSet: CookiesToSet) => void
) {
  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll,
      setAll(cookiesToSet: CookiesToSet) {
        setAll(cookiesToSet);
      },
    },
  });
}
