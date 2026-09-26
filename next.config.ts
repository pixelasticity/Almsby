import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Security headers (incl. CSP with per-request nonces) are set in
// middleware.ts — the next.config.ts headers() API is unreliable on
// Vercel's edge network.
const nextConfig: NextConfig = {
  // Native/WASM packages must be resolved at runtime, not bundled: @resvg/
  // resvg-js ships a .node binary and zxing-wasm a .wasm asset — Turbopack
  // cannot place non-ECMAScript assets into ESM chunks ("asset is not
  // placeable in ESM chunks"). The per-generation verify harness
  // (lib/gs1/verify.ts) pulls both into the label page Server Component, so
  // externalize exactly those two; everything else stays bundled.
  serverExternalPackages: ["@resvg/resvg-js", "zxing-wasm"],

  experimental: {
    // Story-photo uploads travel as Server Action bodies. The framework default
    // is 1 MB, and the client compresses to at most ~4.5 MB (see
    // lib/story/clientCompress.ts), so 6 MB keeps the framework from rejecting a
    // legitimate photo while MAX_PHOTO_BYTES (5 MB) stays the real contract
    // enforced in lib/story/storage.ts — a bigger file must fail with our
    // user-safe message, not a framework body-limit error.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default withNextIntl(nextConfig);
