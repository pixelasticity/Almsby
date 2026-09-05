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
    const value = requiredPublic(
      "NEXT_PUBLIC_RESOLVER_URL",
      process.env.NEXT_PUBLIC_RESOLVER_URL,
    );
    // Placeholder guard (#17 / DoD §10.6): a label encodes this URL verbatim,
    // so fail loudly in deployed envs rather than minting unresolvable symbols.
    assertResolverValueUsable(value);
    return value;
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

  /** Cloudflare R2 credentials (server-only; story-page photos, #71). */
  get r2AccountId(): string {
    return required("R2_ACCOUNT_ID");
  },
  get r2AccessKeyId(): string {
    return required("R2_ACCESS_KEY_ID");
  },
  get r2SecretAccessKey(): string {
    return required("R2_SECRET_ACCESS_KEY");
  },
  get r2BucketName(): string {
    return required("R2_BUCKET_NAME");
  },
  /** Public host the bucket is served under (custom CNAME or *.r2.dev).
   *  Accept both "example.com" and "https://example.com" — callers always build
   *  absolute https URLs, so a stray scheme (r2.dev URLs copy with https://)
   *  must not double-prefix. */
  get r2PublicDomain(): string {
    const value = required("R2_PUBLIC_DOMAIN");
    return value.replace(/^https?:\/\//, "");
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
  // Server-side only. In the client bundle NODE_ENV is inlined as "production"
  // but CI is NOT a NEXT_PUBLIC_* var, so process.env.CI is undefined there —
  // the isCi carve-out would evaluate false and this guard would throw on the
  // dummy localhost values every CI build legitimately inlines, crashing
  // hydration on every page (surfaced as a bare __next_error__ shell). The
  // invariant is fully enforced on the server: this module runs there at boot,
  // and instrumentation.ts re-checks config at server start.
  if (typeof window !== "undefined") return;
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

/**
 * Resolver URL guard (issue #17 / DoD §10.6).
 *
 * Source-level correctness (the CI grep) only proves the code reads
 * NEXT_PUBLIC_RESOLVER_URL in the right place. It cannot catch a VALUE that is
 * correctly coded but wrong in the actual deployment config — a placeholder in
 * Vercel's env panel encodes a placeholder into every label's Digital Link URI.
 * That is the exact failure mode this phase exists to prevent, so the check
 * must live where the value is READ, not where the code is written:
 *
 *   - inside env.resolverUrl — every URI is built through it, so any attempt to
 *     construct a Digital Link in a deployed environment with a placeholder
 *     throws + logs and a maker sees "failed to generate / decode", never a
 *     silently-bad barcode; and
 *   - on server start via instrumentation.ts → assertResolverConfigured(), so a
 *     misconfigured deploy fails to boot instead of running at all.
 *
 * Local dev and CI are exempt by design (same carve-out as assertNotLocalhost):
 * dev labels are not retail-facing, and CI builds can't reach real infra and use
 * dummy values. Every deployed environment (staging + production) is enforced.
 */
const RESOLVER_UNTRUSTED_SUBSTRINGS = ["localhost", "127.0.0.1", "vercel.app"];

/** True for resolver bases that can never produce a retailer-resolvable URI. */
export function isPlaceholderResolverUrl(value: string): boolean {
  const normalized = value.toLowerCase();
  return RESOLVER_UNTRUSTED_SUBSTRINGS.some((needle) =>
    normalized.includes(needle),
  );
}

function assertResolverValueUsable(value: string): void {
  if (isLocalDev || isCi) return;
  if (isPlaceholderResolverUrl(value)) {
    throw new Error(
      `[env] NEXT_PUBLIC_RESOLVER_URL="${value}" looks like a placeholder, not a real resolver. ` +
        "Every barcode encodes this URL — a localhost/127.0.0.1/vercel.app value would " +
        "produce symbols that cannot resolve for retailers. Set the real resolver domain in " +
        "this deployment (production: https://id.almsby.com, staging: https://id.staging.almsby.com).",
    );
  }
}

/** Boot-time assertion (see instrumentation.ts). No-op in local dev and CI. */
export function assertResolverConfigured(): void {
  if (isLocalDev || isCi) return;
  void env.resolverUrl; // presence check + placeholder guard above
}
