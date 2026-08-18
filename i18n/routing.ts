import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  // Cookie-only locale (no URL prefix) — keeps the auth proxy untouched.
  localePrefix: "never",
});

export type Locale = (typeof routing.locales)[number];