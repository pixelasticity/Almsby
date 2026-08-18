import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { cookies } from "next/headers";
import { routing, type Locale } from "./routing";
import en from "../messages/en.json";
import es from "../messages/es.json";

const messages = { en, es } as const;

/**
 * Resolves the active locale per-request from the `NEXT_LOCALE` cookie
 * (falling back to the default). Cookie-only: no URL prefix, so the auth
 * proxy (proxy.ts) is untouched.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale =
    cookieLang && hasLocale(routing.locales, cookieLang)
      ? (cookieLang as Locale)
      : routing.defaultLocale;
  return { locale, messages: messages[locale] };
});