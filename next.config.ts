import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Phase 0: keep defaults. Next 16 builds with Turbopack by default.
};

export default withNextIntl(nextConfig);
