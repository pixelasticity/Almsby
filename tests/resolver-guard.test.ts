import { describe, expect, it, vi } from "vitest";

/**
 * Enforcement-path tests for the resolver URL guard (#17 / DoD §10.6).
 *
 * isPlaceholderResolverUrl (env.test.ts) covers the pure predicate; this file
 * proves the GETTER and startup assertion actually throw in a production-like
 * deploy while staying no-ops in local dev. Each import is a fresh module
 * evaluation (vi.resetModules) so the module-level NODE_ENV/CI carve-out
 * consts are computed from the env we set here.
 */

/** @types/node models NODE_ENV as read-only; route writes through a mutable view. */
function setNodeEnv(value: string | undefined) {
  const mutable = process.env as Record<string, string | undefined>;
  if (value === undefined) delete mutable.NODE_ENV;
  else mutable.NODE_ENV = value;
}

async function loadEnvFresh() {
  vi.resetModules();
  return await import("@/lib/env");
}

function setResolver(value: string | undefined) {
  if (value === undefined) {
    delete process.env.NEXT_PUBLIC_RESOLVER_URL;
  } else {
    process.env.NEXT_PUBLIC_RESOLVER_URL = value;
  }
}

function clearCi() {
  delete process.env.CI;
}

describe("resolver URL guard enforcement", () => {
  it("throws when deployed (production) with a placeholder resolver", async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevCi = process.env.CI;
    setNodeEnv("production");
    clearCi();
    setResolver("https://almsby.vercel.app");
    try {
      const { env } = await loadEnvFresh();
      expect(() => env.resolverUrl).toThrow(/placeholder/);
      expect(() => env.resolverUrl).toThrow(/id\.almsby\.com/);
    } finally {
      setNodeEnv(prevNodeEnv);
      if (prevCi === undefined) clearCi();
      else process.env.CI = prevCi;
      setResolver(undefined);
    }
  });

  it("throws on an unset resolver in a production-like deploy", async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevCi = process.env.CI;
    setNodeEnv("production");
    clearCi();
    setResolver(undefined);
    try {
      const { env } = await loadEnvFresh();
      // requiredPublic fires first (presence), then the placeholder guard.
      expect(() => env.resolverUrl).toThrow(/Missing required environment variable/);
    } finally {
      setNodeEnv(prevNodeEnv);
      if (prevCi === undefined) clearCi();
      else process.env.CI = prevCi;
      setResolver(undefined);
    }
  });

  it("does not throw in CI (build mode) for a dummy localhost resolver", async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevCi = process.env.CI;
    setNodeEnv("production");
    process.env.CI = "true";
    setResolver("http://localhost:3000");
    try {
      const { env } = await loadEnvFresh();
      expect(env.resolverUrl).toBe("http://localhost:3000");
    } finally {
      setNodeEnv(prevNodeEnv);
      if (prevCi === undefined) clearCi();
      else process.env.CI = prevCi;
      setResolver(undefined);
    }
  });

  it("is a no-op in local dev for localhost resolver", async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    setNodeEnv("test"); // local dev bucket (anything but production)
    setResolver("http://127.0.0.1:3000");
    try {
      const { env } = await loadEnvFresh();
      expect(env.resolverUrl).toBe("http://127.0.0.1:3000");
    } finally {
      setNodeEnv(prevNodeEnv);
      setResolver(undefined);
    }
  });
});