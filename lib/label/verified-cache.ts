/**
 * Short-lived server-side cache for per-generation barcode verification.
 *
 * WHY THIS IS SAFE (AGENTS.md rule 5 — fail-closed on barcode generation):
 * verifyBarcode is deterministic in its inputs — same GTIN, same renderer,
 * same resolver URL, same encoder versions produce the same SVGs and the
 * same decode result. Memoizing it is computing-once, not trusting stale
 * proof: every result in here passed a REAL zxing round-trip within the last
 * VERIFICATION_TTL_MS. Successes are cached ONLY — any failing symbol flows
 * through the live decode every time (and evicts a cached success for that
 * key), so a failure can neither be pinned for a TTL window nor masked by an
 * older pass.
 *
 * Inputs are declared in the key on purpose (explicit over implicit): the
 * GTIN, the resolver URL baked into the QR payload, RENDER_VERSION (bump
 * whenever lib/gs1/barcode.ts render options change — every PR touching
 * lib/gs1/* already requires explicit confirmation, so this joins that
 * checklist), and the bwip-js/zxing-wasm versions from package.json. Change
 * any input → different key → live re-verification.
 *
 * Lives OUTSIDE lib/gs1/* (the HIGH-RISK zone): it consumes verifyBarcode's
 * function and result type read-only and never alters verification
 * semantics. It also never throws where verifyBarcode wouldn't — same
 * "per-symbol success, never throws" contract for callers.
 *
 * SERVER ONLY: transitively pulls @resvg/resvg-js (native). Never import
 * from a client component.
 *
 * Process-local by design (module-level Map): on serverless, a cold start
 * resets it — the win is within one warm session (a maker clicking all six
 * download buttons in one sitting), not across visits. Accepted for what
 * this solves; a shared store for a 5-minute window would be scope creep.
 */
import { env } from "@/lib/env";
import {
  verifyBarcode,
  warmBarcodeVerifier,
  type BarcodeVerification,
} from "@/lib/gs1/verify";
import pkg from "../../package.json";
import { isLabelVerified } from "./verified";

/** How long a passed verification may be reused. Short on purpose. */
export const VERIFICATION_TTL_MS = 5 * 60_000;

/**
 * Manual renderer stamp — bump when lib/gs1/barcode.ts render options change
 * (quiet zones, padding, HRI geometry…). Encoder versions below are read
 * from package.json automatically; this one is the human-held half of the
 * key, covered by the existing lib/gs1/* confirmation checklist.
 */
export const RENDER_VERSION = "1";

const BWIP_VERSION = pkg.dependencies["bwip-js"];
const ZXING_VERSION = pkg.dependencies["zxing-wasm"];

/** Cap so a long-lived process can't grow unbounded; oldest-inserted evicted. */
const MAX_ENTRIES = 500;

type CacheEntry = { result: BarcodeVerification; expiresAt: number };
const cache = new Map<string, CacheEntry>();

/**
 * Resolver URL for the key. env.resolverUrl THROWS on a placeholder value in
 * a deployed environment (lib/env's guard) — while verifyBarcode itself
 * would log and return qr.ok = false (fail-closed; the badge shows "failed").
 * Key computation must never change that behavior, so: log, and fall back to
 * a sentinel no real URL can equal; the live verification that follows fails
 * closed, and nothing gets cached (successes only).
 */
function resolverKeyPart(): string {
  try {
    return env.resolverUrl;
  } catch (error) {
    console.error(
      "[label-verify-cache] resolver URL unusable for keying:",
      error
    );
    return "<unusable-resolver>";
  }
}

/** The full invalidation key. Exported so tests can pin every component. */
export function verificationCacheKey(gtin14: string): string {
  return `${gtin14}|${resolverKeyPart()}|${RENDER_VERSION}|${BWIP_VERSION}|${ZXING_VERSION}`;
}

/** Drop expired entries, then bound the cache (insertion order = FIFO). */
function sweep(now: number): void {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next();
    if (oldest.done) break;
    cache.delete(oldest.value);
  }
}

/** Test seam — clears all cached results. */
export function clearVerificationCache(): void {
  cache.clear();
}

/**
 * verifyBarcode through the short-lived cache. Same contract as
 * verifyBarcode itself: never throws, per-symbol ok flags. Callers no longer
 * need their own warmBarcodeVerifier() call — the miss path warms here (the
 * one-time WASM tax, unchanged); a cache hit skips the decode entirely.
 */
export async function verifyBarcodeCached(
  gtin14: string
): Promise<BarcodeVerification> {
  const key = verificationCacheKey(gtin14);
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.result;

  await warmBarcodeVerifier();
  const result = await verifyBarcode(gtin14);

  if (isLabelVerified(result)) {
    sweep(now);
    cache.set(key, { result, expiresAt: now + VERIFICATION_TTL_MS });
  } else {
    // Fail-closed: a failure must never leave an older success for this key
    // serving downloads (covers concurrent in-flight requests where an
    // earlier success may have just landed).
    cache.delete(key);
  }
  return result;
}
