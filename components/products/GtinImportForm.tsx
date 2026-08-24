"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  importGtinAction,
  type GtinImportState,
} from "@/app/(dashboard)/products/[id]/actions";
import styles from "./GtinImportForm.module.css";

// Map the classifier's state to the i18n key for the exact inline warning.
const CLS_KEYS: Record<string, string> = {
  checkDigit: "gtinErrorCheckDigit",
  length: "gtinErrorLength",
  invalid: "gtinErrorInvalid",
};

// Generic action errors map to their translated copy.
const ERROR_KEYS: Record<string, string> = {
  missingProduct: "gtinErrorMissingProduct",
  authRequired: "gtinErrorAuth",
  productNotFound: "gtinErrorNotFound",
  gtinInUse: "gtinErrorInUse",
  saveFailed: "gtinErrorSave",
};

export default function GtinImportForm({
  productId,
  existingGtin,
}: {
  productId: string;
  existingGtin?: string | null;
}) {
  const [state, formAction, isPending] = useActionState<
    GtinImportState,
    FormData
  >(importGtinAction, {});
  const t = useTranslations("products");

  const saved = existingGtin ?? state?.gtin;
  // Prefer the classifier state's translated warning, then generic key copy.
  const warning = state?.cls
    ? CLS_KEYS[state.cls]
      ? t(CLS_KEYS[state.cls])
      : undefined
    : state?.error && ERROR_KEYS[state.error]
      ? t(ERROR_KEYS[state.error])
      : state?.error;

  return (
    <form action={formAction} className={styles.form} noValidate>
      <input type="hidden" name="productId" value={productId} />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="gtin">
          {t("gtinLabel")}
        </label>
        <input
          id="gtin"
          name="gtin"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={styles.input}
          placeholder={`${t("gtinPlaceholder")}`}
        />
        <p className={styles.helper}>{t("gtinHelper")}</p>
      </div>

      {saved ? (
        <p className={styles.saved}>
          {t("gtinSaved")}: <strong>{saved}</strong>
        </p>
      ) : (
        warning && (
          <p role="alert" className={styles.error}>
            {warning}
          </p>
        )
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={isPending || Boolean(saved)}
      >
        {isPending ? "…" : saved ? t("gtinSavedBtn") : t("gtinSubmit")}
      </button>
    </form>
  );
}