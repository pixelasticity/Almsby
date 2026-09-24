"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createBusinessAction } from "@/app/(dashboard)/business/onboarding/actions";
import SubmitButton from "@/components/ui/SubmitButton";
import styles from "./BusinessOnboardingForm.module.css";

const STEPS = 3;

/**
 * Explicit business-creation wizard (post-registration).
 * Three steps: 1 name → 2 industry → 3 country/currency.
 *
 * Every field is a CONTROLLED input backed by React state, so the browser /
 * React form-state resets can never wipe a value the user already entered.
 * All four fields stay mounted (hidden via CSS), so the final submit carries
 * everything to the server action regardless of which step is visible.
 */
export default function BusinessOnboardingForm() {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({
    name: "",
    industryCategory: "",
    operatingCountry: "",
    currency: "",
  });
  const [state, formAction, isPending] = useActionState(
    createBusinessAction,
    undefined
  );
  const t = useTranslations("business");

  const set = (key: keyof typeof values, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <form action={formAction} className={styles.form} noValidate>
      <div className={styles.steps}>
        {Array.from({ length: STEPS }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={`${styles.step} ${step >= n ? styles.stepActive : ""}`}
            aria-current={step === n ? "step" : undefined}
          >
            {n}
          </span>
        ))}
        <span className={styles.stepLabel}>{step}/{STEPS}</span>
      </div>

      {/* Step 1 — always mounted, hidden when not active */}
      <div className={`${styles.field} ${step === 1 ? "" : styles.hidden}`}>
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
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
        <p className={styles.helper}>{t("creation.step1.name.helper")}</p>
      </div>

      {/* Step 2 — always mounted */}
      <div className={`${styles.field} ${step === 2 ? "" : styles.hidden}`}>
        <h2 className={styles.title}>{t("creation.step2.title")}</h2>
        <p className={styles.subtitle}>{t("creation.step2.subtitle")}</p>
        <label className={styles.label} htmlFor="industryCategory">
          {t("creation.step2.category.label")}
        </label>
        <select
          id="industryCategory"
          name="industryCategory"
          className={styles.select}
          value={values.industryCategory}
          onChange={(e) => set("industryCategory", e.target.value)}
        >
          <option value="" disabled>
            —
          </option>
          <option value="apparel">{t("creation.step2.category.options.apparel")}</option>
          <option value="food">{t("creation.step2.category.options.food")}</option>
          <option value="home">{t("creation.step2.category.options.home")}</option>
          <option value="beauty">{t("creation.step2.category.options.beauty")}</option>
          <option value="electronics">{t("creation.step2.category.options.electronics")}</option>
          <option value="other">{t("creation.step2.category.options.other")}</option>
        </select>
        <p className={styles.helper}>{t("creation.step2.category.helper")}</p>
      </div>

      {/* Step 3 — always mounted */}
      <div className={`${styles.field} ${step === 3 ? "" : styles.hidden}`}>
        <h2 className={styles.title}>{t("creation.step3.title")}</h2>
        <div className={styles.row}>
          <div className={styles.col}>
            <label className={styles.label} htmlFor="operatingCountry">
              {t("creation.step3.country.label")}
            </label>
            <select
              id="operatingCountry"
              name="operatingCountry"
              className={styles.select}
              value={values.operatingCountry}
              onChange={(e) => set("operatingCountry", e.target.value)}
            >
              <option value="" disabled>
                —
              </option>
              <option value="US">{t("creation.step3.country.options.us")}</option>
              <option value="GB">{t("creation.step3.country.options.gb")}</option>
              <option value="EU">{t("creation.step3.country.options.eu")}</option>
              <option value="CA">{t("creation.step3.country.options.ca")}</option>
              <option value="AU">{t("creation.step3.country.options.au")}</option>
              <option value="OTHER">{t("creation.step3.country.options.other")}</option>
            </select>
          </div>
          <div className={styles.col}>
            <label className={styles.label} htmlFor="currency">
              {t("creation.step3.currency.label")}
            </label>
            <select
              id="currency"
              name="currency"
              className={styles.select}
              value={values.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              <option value="" disabled>
                —
              </option>
              <option value="USD">{t("creation.step3.currency.options.usd")}</option>
              <option value="GBP">{t("creation.step3.currency.options.gbp")}</option>
              <option value="EUR">{t("creation.step3.currency.options.eur")}</option>
              <option value="CAD">{t("creation.step3.currency.options.cad")}</option>
              <option value="AUD">{t("creation.step3.currency.options.aud")}</option>
            </select>
          </div>
        </div>
        <p className={styles.helper}>{t("creation.step3.helper")}</p>
      </div>

      {state?.error && (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      )}

      <div className={styles.actions}>
        {step > 1 && (
          <button type="button" className={styles.secondary} onClick={back}>
            {t("creation.back")}
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
          <SubmitButton className={styles.primary}>
            {t("creation.step3.cta")}
          </SubmitButton>
        )}
      </div>
    </form>
  );
}