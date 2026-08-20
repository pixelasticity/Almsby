"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createBusinessAction } from "@/app/(dashboard)/business/onboarding/actions";
import styles from "./BusinessOnboardingForm.module.css";

const STEPS = 3;

/**
 * Explicit business-creation wizard (post-registration).
 * Three steps: 1 name → 2 industry → 3 country/currency.
 */
export default function BusinessOnboardingForm() {
  const [step, setStep] = useState(1);
  const [state, formAction, isPending] = useActionState(
    createBusinessAction,
    undefined
  );
  const t = useTranslations("business");

  const next = () => setStep((s) => Math.min(s + 1, STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <form action={formAction} className={styles.form} noValidate>
      <div className={styles.steps}>
        {Array.from({ length: STEPS }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={`${styles.step} ${step >= n ? styles.stepActive : ""}`}
          >
            {n}
          </span>
        ))}
        <span className={styles.stepLabel}>{step}/{STEPS}</span>
      </div>

      {step === 1 && (
        <div className={styles.field}>
          <h2 className={styles.title}>{t("creation.step1.title")}</h2>
          <p className={styles.subtitle}>{t("creation.step1.subtitle")}</p>
          <label className={styles.label} htmlFor="name">
            {t("creation.step1.name.label")}
          </label>
          <input
            id="name"
            name="name"
            className={styles.input}
            placeholder={t("creation.step1.name.placeholder")}
            required
          />
          <p className={styles.helper}>{t("creation.step1.name.helper")}</p>
        </div>
      )}

      {step === 2 && (
        <div className={styles.field}>
          <h2 className={styles.title}>{t("creation.step2.title")}</h2>
          <p className={styles.subtitle}>{t("creation.step2.subtitle")}</p>
          <label className={styles.label} htmlFor="industryCategory">
            {t("creation.step2.category.label")}
          </label>
          <select
            id="industryCategory"
            name="industryCategory"
            className={styles.input}
            defaultValue=""
          >
            <option value="" disabled>
              —
            </option>
            <option value="apparel">Apparel / textiles</option>
            <option value="food">Food & beverage</option>
            <option value="home">Home & goods</option>
            <option value="beauty">Beauty & care</option>
            <option value="electronics">Electronics</option>
            <option value="other">Other</option>
          </select>
          <p className={styles.helper}>{t("creation.step2.category.helper")}</p>
        </div>
      )}

      {step === 3 && (
        <div className={styles.field}>
          <h2 className={styles.title}>{t("creation.step3.title")}</h2>
          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label} htmlFor="operatingCountry">
                {t("creation.step3.country.label")}
              </label>
              <select
                id="operatingCountry"
                name="operatingCountry"
                className={styles.input}
                defaultValue=""
              >
                <option value="" disabled>
                  —
                </option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="EU">European Union</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className={styles.col}>
              <label className={styles.label} htmlFor="currency">
                {t("creation.step3.currency.label")}
              </label>
              <select
                id="currency"
                name="currency"
                className={styles.input}
                defaultValue=""
              >
                <option value="" disabled>
                  —
                </option>
                <option value="USD">USD — US dollar</option>
                <option value="GBP">GBP — Pound</option>
                <option value="EUR">EUR — Euro</option>
                <option value="CAD">CAD — Canadian dollar</option>
                <option value="AUD">AUD — Australian dollar</option>
              </select>
            </div>
          </div>
          <p className={styles.helper}>{t("creation.step3.helper")}</p>
        </div>
      )}

      {state?.error && (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      )}

      <div className={styles.actions}>
        {step > 1 && (
          <button type="button" className={styles.secondary} onClick={back}>
            Back
          </button>
        )}
        {step < STEPS ? (
          <button
            type="button"
            className={styles.primary}
            onClick={next}
            disabled={isPending}
          >
            {t(`creation.step${step}.cta`)}
          </button>
        ) : (
          <button
            type="submit"
            className={styles.primary}
            disabled={isPending}
          >
            {isPending ? "…" : t("creation.step3.cta")}
          </button>
        )}
      </div>
    </form>
  );
}