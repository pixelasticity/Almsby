"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Browser-side Supabase client for Client Components (e.g. sign-in forms). */
export function createBrowserSupabaseClient() {
  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}