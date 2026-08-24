"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setLocaleAction } from "@/lib/i18n/actions";

const LABELS: Record<string, string> = { en: "EN", es: "ES" };

/**
 * Cookie-based locale switcher. Sets `NEXT_LOCALE` via a server action and
 * re-renders the server tree (i18n/request.ts reads the cookie). No URL
 * prefix, so the auth proxy is untouched.
 *
 * The active locale is exposed via aria-current (not disabled) so screen
 * readers and keyboard users can always identify it.
 */
export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function onSelect(next: string) {
    if (next === locale) return;
    void setLocaleAction(next).then(() => router.refresh());
  }

  return (
    <div
      style={{
        display: "inline-flex",
        gap: 2,
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: 2,
        background: "var(--card)",
      }}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onSelect(l)}
          aria-current={l === locale ? "true" : undefined}
          style={{
            font: "inherit",
            fontSize: 12,
            border: 0,
            borderRadius: 999,
            padding: "6px 12px",
            cursor: "pointer",
            background: l === locale ? "var(--green-600)" : "transparent",
            color: l === locale ? "#fff" : "var(--neutral-600)",
          }}
        >
          {LABELS[l] ?? l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}