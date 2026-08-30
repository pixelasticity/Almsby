"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

// Stable references so useSyncExternalStore never resubscribes.
const emptySubscribe = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, getHydrated, getServerHydrated);
}

/**
 * Print trigger for the exact-size label route (#9). Hydration-safe: renders
 * nothing until mounted, so SSR and first client paint agree (the label page
 * learned this lesson with bwip-js output mismatches).
 */
export default function PrintButton() {
  const t = useTranslations("products");
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        padding: "8px 14px",
        borderRadius: 6,
        border: "1px solid #d4d4d4",
        background: "#fafafa",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {t("labelPrintButton")}
    </button>
  );
}
