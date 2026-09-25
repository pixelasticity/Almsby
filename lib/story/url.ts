/**
 * The public story page URL — exactly one place constructs it.
 *
 * Two callers need the same thing from different directions: the dashboard's
 * "View live story" link (relative, resolvable on any host) and the public
 * page's canonical link (absolute, one host). Two copies of a `/s/${gtin}`
 * template is precisely the kind of duplication that drifts silently, so both
 * come from here.
 */
import { env } from "@/lib/env";
import { toGtin14 } from "@/lib/gs1/gtin";

/**
 * Relative path (`/s/{gtin14}`) — for in-app links.
 *
 * Domain-agnostic on purpose: it resolves on whatever host the caller is
 * served from. Normalizes to the 14-digit form so the same product can never
 * have two spellings in one link surface (13-digit EAN-13 and 14-digit GTIN-14
 * are the same identifier), and falls back to the raw value when it is not a
 * valid GTIN — producing a URL the route will 404 on, never a thrown error on
 * public input.
 */
export function storyPagePath(gtinValue: string): string {
  return `/s/${toGtin14(gtinValue) ?? gtinValue}`;
}

/**
 * Absolute canonical URL for crawlers — on the RESOLVER host.
 *
 * Why the resolver host and not the app host: every scan and every shared
 * barcode link arrives at the resolver domain (the resolver redirects
 * host-relative to `/s/{gtin14}`), so that is the URL search engines actually
 * discover. The resolver domain is also the permanent one by design
 * (AGENTS.md rule 3) while NEXT_PUBLIC_APP_URL may change freely — so
 * consolidating crawl signals on the domain that cannot move is the stable
 * choice.
 *
 * FLAGGED, DELIBERATE EXCEPTION (Phase 2, decided 2026-09-24): AGENTS.md rule 3
 * scopes NEXT_PUBLIC_RESOLVER_URL to GS1 Digital Link URIs, and this is not
 * one — it is the resolver *host* used to anchor canonically-served content.
 * Approved explicitly and recorded in guidelines/delivery/phase2/dod-status.md.
 * Do not copy this pattern to another surface without the same explicit call,
 * and never swap it for env.appUrl "for consistency".
 */
export function storyPageCanonicalUrl(gtinValue: string): string {
  // Same trailing-slash normalization as lib/gs1/digital-link.ts: a stray "/"
  // in deployment config must not produce "…//s/{gtin}".
  const base = env.resolverUrl.replace(/\/+$/, "");
  return `${base}${storyPagePath(gtinValue)}`;
}
