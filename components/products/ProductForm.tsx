"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createProductAction } from "@/app/(dashboard)/products/actions";
import styles from "./ProductForm.module.css";

export default function ProductForm() {
  const [state, formAction, isPending] = useActionState(
    createProductAction,
    undefined
  );
  const t = useTranslations("products");

  return (
    <form action={formAction} className={styles.form} noValidate>
      <h2 className={styles.title}>{t("createTitle")}</h2>

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          {t("nameLabel")}
          <span className={styles.badge}>{t("nameRequired")}</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder={t("nameHelper")}
          className={styles.input}
        />
        <p className={styles.helper}>{t("nameHelper")}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="brand" className={styles.label}>
          {t("brandLabel")}
          <span className={styles.badge}>{t("optional")}</span>
        </label>
        <input
          id="brand"
          name="brand"
          type="text"
          placeholder={t("brandHelper")}
          className={styles.input}
        />
        <p className={styles.helper}>{t("brandHelper")}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="netContent" className={styles.label}>
          {t("netContentLabel")}
          <span className={styles.badge}>{t("optional")}</span>
        </label>
        <input
          id="netContent"
          name="netContent"
          type="text"
          placeholder={t("netContentHelper")}
          className={styles.input}
        />
        <p className={styles.helper}>{t("netContentHelper")}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="countryOfOrigin" className={styles.label}>
          {t("countryLabel")}
          <span className={styles.badge}>{t("optional")}</span>
        </label>
        <input
          id="countryOfOrigin"
          name="countryOfOrigin"
          type="text"
          placeholder={t("countryHelper")}
          className={styles.input}
        />
        <p className={styles.helper}>{t("countryHelper")}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="materialComposition" className={styles.label}>
          {t("materialLabel")}
          <span className={styles.badge}>{t("optional")}</span>
        </label>
        <input
          id="materialComposition"
          name="materialComposition"
          type="text"
          placeholder={t("materialHelper")}
          className={styles.input}
        />
        <p className={styles.helper}>{t("materialHelper")}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="status" className={styles.label}>
          {t("statusLabel")}
        </label>
        <select
          id="status"
          name="status"
          className={styles.input}
          defaultValue="draft"
        >
          <option value="draft">{t("statusDraft")}</option>
          <option value="active">{t("statusActive")}</option>
          <option value="archived">{t("statusArchived")}</option>
        </select>
        <p className={styles.helper}>{t("statusHelper")}</p>
      </div>

      {state?.error && (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className={styles.submit}>
        {isPending ? "…" : t("submit")}
      </button>
    </form>
  );
}