"use server";

import { cookies } from "next/headers";

const LOCALE_COOKIE = "NEXT_LOCALE";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Sets the active locale cookie server-side; call from the client, then refresh. */
export async function setLocaleAction(locale: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: MAX_AGE,
  });
}