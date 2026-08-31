/**
 * Next.js server bootstrap hook (runs once per server instance).
 *
 * Enforces issue #17 / DoD §10.6 at startup: a deployed environment whose
 * configured resolver origin is a placeholder (localhost / 127.0.0.1 /
 * vercel.app / unset) should not boot at all — every label it could serve
 * would encode an unresolvable Digital Link URI. No-op in local dev and CI.
 * The check itself lives in lib/env.ts (assertResolverConfigured) — this file
 * never touches the env var directly, by design.
 */
export async function register(): Promise<void> {
  const { assertResolverConfigured } = await import("@/lib/env");
  assertResolverConfigured();
}