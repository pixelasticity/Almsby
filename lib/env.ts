/**
 * Single typed entry point for environment variables.
 *
 * Only this module may read process.env directly. In particular
 * NEXT_PUBLIC_RESOLVER_URL exists nowhere else in the codebase — see
 * lib/gs1/digital-link.ts and the resolver-discipline check in
 * .github/workflows/ci.yml.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  /** Maker dashboard / marketing site domain. Never used for Digital Link URIs. */
  get appUrl(): string {
    return required("NEXT_PUBLIC_APP_URL");
  },

  /** The ONLY base URL allowed when constructing GS1 Digital Link URIs. */
  get resolverUrl(): string {
    return required("NEXT_PUBLIC_RESOLVER_URL");
  },

  get databaseUrl(): string {
    return required("DATABASE_URL");
  },

  get directUrl(): string | undefined {
    return process.env.DIRECT_URL;
  },

  get supabaseUrl(): string {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },

  get supabasePublishableKey(): string {
    return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  },

     /** Server-only secret key (admin, bypasses RLS). Optional for Phase 0 core flows. */
  get secretKey(): string | undefined {
    // Preferred modern name, with the legacy SUPABASE_SERVICE_ROLE_KEY as fallback.
    return process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  },
};

/**
 * Localhost dev URLs (e.g. the local Supabase CLI `http://127.0.0.1:54321`)
 * must never be inlined into a deployed production/staging build, otherwise
 * server-side calls (e.g. `supabase.auth.signUp`) fail with an opaque
 * `fetch failed` from the platform's sandbox. Fail loud & early instead.
 */
const isLocalDev = process.env.NODE_ENV !== "production";
// CI builds (GitHub Actions, etc.) run `next build` with dummy localhost values
// because they can't reach real Supabase and don't serve traffic — the guard
// must not break them. Real Vercel deploy builds don't set CI, so a localhost
// URL there still fails fast instead of deploying a broken app.
const isCi = process.env.CI === "true";
function assertNotLocalhost(key: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_APP_URL") {
  const val = process.env[key];
  if (!val) return; // `required()` already surfaces "Missing ... environment variable"
  try {
    const { hostname } = new URL(val);
    if (!isLocalDev && !isCi && (hostname === "127.0.0.1" || hostname === "localhost")) {
      throw new Error(
        `[env] ${key} is a localhost dev URL (${val}) in a deployed environment. ` +
          "Set the real production URL in Vercel; this build can't reach Supabase.",
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("[env]")) throw e;
    // Not a parseable URL — let `required()` / upstream handle.
  }
}
assertNotLocalhost("NEXT_PUBLIC_SUPABASE_URL");
assertNotLocalhost("NEXT_PUBLIC_APP_URL");
