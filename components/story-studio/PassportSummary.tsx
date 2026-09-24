"use client";

import React from "react";
import { useTranslations } from "next-intl";
import styles from "./story-studio.module.css";

type PassportProduct = {
  gtin?: { gtinValue: string } | null;
  countryOfOrigin?: string | null;
  materialComposition?: string | null;
  recyclable?: boolean | null;
};

export default function PassportSummary({ product }: { product: PassportProduct }) {
  const t = useTranslations("passport");

  return (
    <div className={styles.passport}>
      <div className={styles.passportHeader}>
        <div className={styles.passportDot} />
        <h3 className={styles.passportTitle}>{t("title")}</h3>
      </div>
      <div className={styles.passportGrid}>
        <PassportItem label={t("gtin")} value={product.gtin?.gtinValue || "—"} />
        <PassportItem
          label={t("origin")}
          value={product.countryOfOrigin || t("notSet")}
        />
        <PassportItem
          label={t("material")}
          value={product.materialComposition || t("notSet")}
        />
        {/* recyclable is nullable (Boolean?): "not yet specified" (null) must
            not be conflated with an explicit "No". Dash until the maker states
            it — compliance-field accuracy matters. */}
        <PassportItem
          label={t("recyclable")}
          value={product.recyclable === null || product.recyclable === undefined
            ? "—"
            : product.recyclable ? t("yes") : t("no")}
        />
      </div>
    </div>
  );
}

function PassportItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.passportItem}>
      <span className={styles.passportItemLabel}>{label}</span>
      <span className={styles.passportItemValue}>{value}</span>
    </div>
  );
}

