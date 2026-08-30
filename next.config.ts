import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Baseline hardening. CSP is intentionally deferred (needs a nonce strategy
// with Next inline scripts + Vercel); the rest are static-safe.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Native/WASM packages must be resolved at runtime, not bundled: @resvg/
  // resvg-js ships a .node binary and zxing-wasm a .wasm asset — Turbopack
  // cannot place non-ECMAScript assets into ESM chunks ("asset is not
  // placeable in ESM chunks"). The per-generation verify harness
  // (lib/gs1/verify.ts) pulls both into the label page Server Component, so
  // externalize exactly those two; everything else stays bundled.
  serverExternalPackages: ["@resvg/resvg-js", "zxing-wasm"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
