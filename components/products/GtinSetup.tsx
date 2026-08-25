"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import GtinImportForm from "./GtinImportForm";
import ConciergeForm from "./ConciergeForm";
import styles from "./GtinSetup.module.css";

/**
 * GTIN setup fork on a product's detail page (#3 + #4).
 * Option A: the maker already has a GTIN / company prefix ("own_prefix") →
 * import form. Option B: they have no prefix → concierge (guided, "almsby_assisted").
 * If a GTIN is already attached, show it (read-only) and allow re-entry.
 */
export default function GtinSetup({
  productId,
  existingGtin,
}: {
  productId: string;
  existingGtin?: string | null;
}) {
  const [path, setPath] = useState<"import" | "concierge">("import");
  const t = useTranslations("products");

  if (existingGtin) {
    return (
      <div className={styles.savedBlock}>
        <p className={styles.saved}>
          {t("gtinSaved")}: <strong>{existingGtin}</strong>
        </p>
        <GtinImportForm productId={productId} existingGtin={existingGtin} />
      </div>
    );
  }

  return (
    <div className={styles.fork}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={path === "import" ? styles.tabActive : styles.tab}
          onClick={() => setPath("import")}
        >
          {t("gtinSetupImport")}
        </button>
        <button
          type="button"
          className={path === "concierge" ? styles.tabActive : styles.tab}
          onClick={() => setPath("concierge")}
        >
          {t("gtinSetupConcierge")}
        </button>
      </div>
      {path === "import" ? (
        <GtinImportForm productId={productId} existingGtin={null} />
      ) : (
        <ConciergeForm productId={productId} />
      )}
    </div>
  );
}