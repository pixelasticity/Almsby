"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  X_DIMENSION_PRESETS,
  pngScaleForX,
  PNG_DPI,
} from "@/lib/gs1/print-size";
import { isDownloadEnabled } from "@/lib/gs1/download-gate";
import { useBarcodeRenders } from "@/lib/hooks/useBarcodeRenders";
import { useHydrated } from "@/lib/hooks/useHydrated";
import styles from "./LabelDownloads.module.css";

function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Print-ready asset downloads (#9). The SVGs are produced by the SAME pure
 * renderers the server-side verify harness rasterizes — deterministic output
 * means downloaded === verified. PNG goes through a server route that
 * rasterizes those same SVGs at a DPI/scale that achieves the chosen
 * X-dimension; PDF is the exact-size print route.
 */
export default function LabelDownloads({
  productId,
  gtin14,
  verified,
}: {
  productId: string;
  gtin14: string;
  verified: boolean;
}) {
  const t = useTranslations("products");
  const hydrated = useHydrated();
  const [presetId, setPresetId] = useState(X_DIMENSION_PRESETS[0].id);

  const preset =
    X_DIMENSION_PRESETS.find((p) => p.id === presetId) ?? X_DIMENSION_PRESETS[0];

  const { qr, dm, legacy } = useBarcodeRenders(gtin14, true);

  const enabled = isDownloadEnabled(verified, hydrated);
  const pngParams = `x=${preset.mm}`;
  const pngHref = (symbol: string) =>
    `/products/${productId}/label/png?symbol=${symbol}&${pngParams}`;

  return (
    <section className={styles.downloads} aria-label={t("labelDownloadsTitle")}>
      <h2 className={styles.title}>{t("labelDownloadsTitle")}</h2>

      <div className={styles.presetRow}>
        <label className={styles.presetLabel} htmlFor="x-dim-preset">
          {t("labelPreset")}
        </label>
        <select
          id="x-dim-preset"
          value={presetId}
          onChange={(e) => setPresetId(e.target.value)}
          disabled={!enabled}
        >
          {X_DIMENSION_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {t("labelPresetOption", { mm: p.mm.toFixed(2) })}
            </option>
          ))}
        </select>
        <span className={styles.presetNote}>
          {t("labelPresetNote", {
            mm: pngScaleForX(preset.mm, PNG_DPI).achievedXMm.toFixed(3),
          })}
        </span>
      </div>

      <div className={styles.buttonRow}>
        {qr && (
          <button
            type="button"
            className={styles.button}
            disabled={!enabled}
            onClick={() => downloadSvg(qr.svg, `almsby-${gtin14}-qr.svg`)}
          >
            {t("labelDownloadSvgQr")}
          </button>
        )}
        {dm && (
          <button
            type="button"
            className={styles.button}
            disabled={!enabled}
            onClick={() => downloadSvg(dm, `almsby-${gtin14}-datamatrix.svg`)}
          >
            {t("labelDownloadSvgDm")}
          </button>
        )}
        {legacy && (
          <button
            type="button"
            className={styles.button}
            disabled={!enabled}
            onClick={() =>
              downloadSvg(legacy.svg, `almsby-${legacy.value}-ean13.svg`)
            }
          >
            {t("labelDownloadSvgLegacy")}
          </button>
        )}
        {qr && (
          <a
            className={enabled ? styles.button : styles.buttonDisabled}
            aria-disabled={!enabled}
            href={enabled ? pngHref("qr") : undefined}
            download
          >
            {t("labelDownloadPngQr")}
          </a>
        )}
        {dm && (
          <a
            className={enabled ? styles.button : styles.buttonDisabled}
            aria-disabled={!enabled}
            href={enabled ? pngHref("dm") : undefined}
            download
          >
            {t("labelDownloadPngDm")}
          </a>
        )}
        {legacy && (
          <a
            className={enabled ? styles.button : styles.buttonDisabled}
            aria-disabled={!enabled}
            href={enabled ? pngHref("legacy") : undefined}
            download
          >
            {t("labelDownloadPngLegacy")}
          </a>
        )}
        <a
          className={enabled ? styles.button : styles.buttonDisabled}
          aria-disabled={!enabled}
          href={
            enabled ? `/products/${productId}/label/print?x=${preset.mm}` : undefined
          }
        >
          {t("labelPrintExact")}
        </a>
      </div>

      {!enabled && (
        <p className={styles.disabledNote}>{t("labelDownloadsLocked")}</p>
      )}
    </section>
  );
}
