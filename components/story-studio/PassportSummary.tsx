import React from "react";
import styles from "./story-studio.module.css";

type PassportProduct = {
  gtin?: { gtinValue: string } | null;
  countryOfOrigin?: string | null;
  materialComposition?: string | null;
  recyclable?: boolean | null;
};

export default function PassportSummary({ product }: { product: PassportProduct }) {
  return (
    <div className={styles.passport}>
      <div className={styles.passportHeader}>
        <div className={styles.passportDot} />
        <h3 className={styles.passportTitle}>Product Passport Data</h3>
      </div>
      <div className={styles.passportGrid}>
        <PassportItem label="GTIN-14" value={product.gtin?.gtinValue || "—"} />
        <PassportItem label="Origin" value={product.countryOfOrigin || "Not set"} />
        <PassportItem label="Material" value={product.materialComposition || "Not set"} />
        <PassportItem label="Recyclable" value={product.recyclable ? "Yes" : "No"} />
      </div>
    </div>
  );
}

function PassportItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span className={styles.passportItemLabel}>{label}</span>
      <span className={styles.passportItemValue}>{value}</span>
    </div>
  );
}

