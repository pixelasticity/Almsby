import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pkg from "../package.json";

// Mock the verify harness: these tests pin CACHE behavior (hit/miss/TTL/
// eviction), not decode correctness — that stays with tests/gs1/*, untouched.
vi.mock("@/lib/gs1/verify", () => ({
  verifyBarcode: vi.fn(),
  warmBarcodeVerifier: vi.fn(async () => {}),
}));

import {
  verifyBarcodeCached,
  verificationCacheKey,
  clearVerificationCache,
  VERIFICATION_TTL_MS,
  RENDER_VERSION,
} from "@/lib/label/verified-cache";
import { verifyBarcode, warmBarcodeVerifier } from "@/lib/gs1/verify";

const mockedVerify = vi.mocked(verifyBarcode);
const mockedWarm = vi.mocked(warmBarcodeVerifier);

const ALL_OK = {
  qr: { ok: true, uri: "https://id.almsby.com/01/04006381333931" },
  dm: { ok: true },
  legacy: { ok: true, value: "40063813333931" },
};
const QR_FAILS = { ...ALL_OK, qr: { ...ALL_OK.qr, ok: false } };

beforeEach(() => {
  clearVerificationCache();
  mockedVerify.mockReset();
  mockedWarm.mockClear();
  // env.resolverUrl reads this lazily (getter), so per-test assignment works.
  process.env.NEXT_PUBLIC_RESOLVER_URL = "https://id.almsby.com";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("verificationCacheKey — invalidation inputs", () => {
  it("includes the GTIN, renderer stamp, and both encoder versions", () => {
    const key = verificationCacheKey("04006381333931");
    expect(key).toContain("04006381333931");
    // Guards: if RENDER_VERSION or either version ever drops out of the key,
    // an input change could silently reuse stale verification results.
    expect(key).toContain(RENDER_VERSION);
    expect(key).toContain(pkg.dependencies["bwip-js"]);
    expect(key).toContain(pkg.dependencies["zxing-wasm"]);
    expect(key).toContain("id.almsby.com");
  });

  it("changes when the resolver URL (QR payload input) changes", () => {
    const before = verificationCacheKey("04006381333931");
    process.env.NEXT_PUBLIC_RESOLVER_URL = "https://id.staging.almsby.com";
    const after = verificationCacheKey("04006381333931");
    expect(after).not.toBe(before);
  });
});

describe("verifyBarcodeCached — hit, TTL, fail-closed", () => {
  it("verifies once, then serves the cached result within the TTL", async () => {
    mockedVerify.mockResolvedValue(ALL_OK);
    vi.useFakeTimers({ toFake: ["Date"] });

    const first = await verifyBarcodeCached("04006381333931");
    const second = await verifyBarcodeCached("04006381333931");
    expect(mockedVerify).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);

    // Still fresh just before expiry.
    vi.advanceTimersByTime(VERIFICATION_TTL_MS - 1);
    await verifyBarcodeCached("04006381333931");
    expect(mockedVerify).toHaveBeenCalledTimes(1);
  });

  it("re-verifies after the TTL expires", async () => {
    mockedVerify.mockResolvedValue(ALL_OK);
    vi.useFakeTimers({ toFake: ["Date"] });

    await verifyBarcodeCached("04006381333931");
    vi.advanceTimersByTime(VERIFICATION_TTL_MS + 1);
    await verifyBarcodeCached("04006381333931");
    expect(mockedVerify).toHaveBeenCalledTimes(2);
  });

  it("never caches a failing verification (successes only)", async () => {
    mockedVerify.mockResolvedValue(QR_FAILS);

    const first = await verifyBarcodeCached("04006381333931");
    expect(first.qr.ok).toBe(false);
    const second = await verifyBarcodeCached("04006381333931");
    expect(second.qr.ok).toBe(false);
    // Every call went to the live decoder — a failure is never pinned.
    expect(mockedVerify).toHaveBeenCalledTimes(2);
  });

  it("a concurrent failure evicts an in-flight success (fail-closed race)", async () => {
    // Both calls start as misses (the sync get happens before either awaits),
    // resolve out of order — success first, then failure — and the failure
    // must leave NOTHING cached, so the next request goes live again.
    mockedVerify
      .mockResolvedValueOnce(ALL_OK)
      .mockResolvedValueOnce(QR_FAILS);

    const [a, b] = await Promise.all([
      verifyBarcodeCached("04006381333931"),
      verifyBarcodeCached("04006381333931"),
    ]);
    expect(a.qr.ok).toBe(true);
    expect(b.qr.ok).toBe(false);
    expect(mockedVerify).toHaveBeenCalledTimes(2);

    mockedVerify.mockResolvedValue(ALL_OK);
    await verifyBarcodeCached("04006381333931");
    // Third call verified live: the failed result did not leave the earlier
    // success serving from cache.
    expect(mockedVerify).toHaveBeenCalledTimes(3);
  });

  it("warms the WASM on the miss path only (contract unchanged)", async () => {
    mockedVerify.mockResolvedValue(ALL_OK);

    await verifyBarcodeCached("04006381333931"); // miss → warm + verify
    await verifyBarcodeCached("04006381333931"); // hit → neither
    expect(mockedWarm).toHaveBeenCalledTimes(1);
    expect(mockedVerify).toHaveBeenCalledTimes(1);
  });
});
