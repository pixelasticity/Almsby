/**
 * Single typed entry point for environment variables.
 *
 * Only this module may read process.env directly. In particular
 * NEXT_PUBLIC_RESOLVER_URL exists nowhere else in the codebase — see
 * lib/gs1/digital-link.ts and the resolver-discipline check in
 * .github/workflows/ci.yml.
 *
 * IMPORTANT: NEXT_PUBLIC_* values MUST be read with a LITERAL member access
 * (process.env.NEXT_PUBLIC_X). Next.js inlines those into the client bundle at
 * build time and explicitly does NOT support dynamic lookups like
 * process.env[name] — a dynamic access yields undefined in the browser, which
 * silently broke the client-side barcode renderers (QR never drew). Server-only
 * vars may keep dynamic access: process.env is the real Node env object there.
 */

/** Server-only vars: dynamic access is fine (process.env is real on Node). */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** NEXT_PUBLIC_* vars: literal access required for build-time inlining. */
function requiredPublic(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  /** Maker dashboard / marketing site domain. Never used for Digital Link URIs. */
  get appUrl(): string {
    return requiredPublic("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);
  },

  /** The ONLY base URL allowed when constructing GS1 Digital Link URIs. */
  get resolverUrl(): string {
    return requiredPublic(
      "NEXT_PUBLIC_RESOLVER_URL",
      process.env.NEXT_PUBLIC_RESOLVER_URL,
    );
  },

  get databaseUrl(): string {
    return required("DATABASE_URL");
  },

  get directUrl(): string | undefined {
    return process.env.DIRECT_URL;
  },

  get supabaseUrl(): string {
    return requiredPublic(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
  },

  get supabasePublishableKey(): string {
    return requiredPublic(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
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
function assertNotLocalhost(name: string, value: string | undefined) {
  if (!value) return; // `required()` surfaces "Missing ... environment variable"
  try {
    const { hostname } = new URL(value);
    if (!isLocalDev && !isCi && (hostname === "127.0.0.1" || hostname === "localhost")) {
      throw new Error(
        `[env] ${name} is a localhost dev URL (${value}) in a deployed environment. ` +
          "Set the real production URL in Vercel; this build can't reach Supabase.",
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("[env]")) throw e;
    // Not a parseable URL — let upstream handle.
  }
}
assertNotLocalhost("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
assertNotLocalhost("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);
