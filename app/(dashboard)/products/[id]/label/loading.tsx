import { getTranslations } from "next-intl/server";
import styles from "./loading.module.css";

/**
 * Label-segment loading boundary. The label pages block on warmBarcodeVerifier
 * + a full decode round-trip (WASM init + ~1s) before their first byte — the
 * slowest server path in the app. Without this file the user stares at a bare
 * screen; with it the shell streams immediately and the symbol slots pulse
 * until the real, verified SVGs replace them. Pure geometry + one text line,
 * so no CLS when content arrives.
 */
export default async function LabelLoading() {
  const t = await getTranslations("products");

  return (
    <div className={styles.page} role="status" aria-live="polite">
      <div className={styles.row}>
        <div className={styles.blockQr} />
        <div className={styles.blockDm} />
        <div className={styles.blockLegacy} />
      </div>
      <p className={styles.note}>{t("labelLoading")}</p>
    </div>
  );
}