/**
 * Next.js server bootstrap hook (runs once per server instance).
 *
 * Enforces issue #17 / DoD §10.6 at startup: a deployed environment whose
 * NEXT_PUBLIC_RESOLVER_URL is a placeholder (localhost / 127.0.0.1 /
 * vercel.app / unset) should not boot at all — every label it could serve
 * would encode an unresolvable Digital Link URI. No-op in local dev and CI
 * (see lib/env.ts assertResolverConfigured).
 */
export async function register(): Promise<void> {
  const { assertResolverConfigured } = await import("@/lib/env");
  assertResolverConfigured();
}