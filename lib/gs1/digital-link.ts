import { env } from "@/lib/env";

/**
 * The ONLY place GS1 Digital Link URIs are constructed.
 *
 * Discipline (Phase 0 brief §5): the resolver base URL must come exclusively
 * from NEXT_PUBLIC_RESOLVER_URL — never NEXT_PUBLIC_APP_URL, never a hardcoded
 * domain. Enforcement: CI greps for the env var name outside lib/env.ts.
 */
export function buildDigitalLinkUri(gtin: string): string {
  const base = env.resolverUrl.replace(/\/+$/, "");
  return `${base}/01/${gtin}`;
}