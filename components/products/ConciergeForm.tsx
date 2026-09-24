"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { conciergeAction } from "@/app/(dashboard)/products/[id]/concierge/actions";
import { resolveActionErrorKey } from "@/lib/products/action-errors";
import FormError from "@/components/ui/FormError";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
import styles from "./ConciergeForm.module.css";

type Mode = "choice" | "explain" | "prefix";

// Every error code conciergeAction can return, as an allowlist: the codes map
// 1:1 to keys inside the `concierge` namespace (no rename needed), so an
// identity Record would only pretend otherwise. Anything unknown falls back to
// `genericError` — next-intl throws on an unknown key, so we never pass one
// blindly.
const KNOWN_ERROR_CODES: readonly string[] = [
  "missingProduct",
  "authRequired",
  "productNotFound",
  "saveFailed",
  "prefixEmpty",
  "prefixNonNumeric",
  "prefixInvalid",
  "prefixExhausted",
];

export default function ConciergeForm({
  productId,
}: {
  productId: string;
}) {
  const [mode, setMode] = useState<Mode>("choice");
  const [state, formAction] = useActionState<
    { error?: string } | { ok: true; gtin: string },
    FormData
  >(conciergeAction, {});
  const t = useTranslations("products");
  const errKey = "error" in state ? state.error : undefined;

  const msgKey = resolveActionErrorKey(errKey, KNOWN_ERROR_CODES, "genericError");

  return (
    <div className={styles.wrap}>
      {mode === "choice" && (
        <div className={styles.modal}>
          <h3 className={styles.head}>{t("concierge.choiceTitle")}</h3>
          <p className={styles.body}>{t("concierge.choiceBody")}</p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => setMode("prefix")}
          >
            {t("concierge.optionHave")}
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setMode("explain")}
          >
            {t("concierge.optionNeed")}
          </button>
        </div>
      )}

      {mode === "explain" && (
        <div className={styles.modal}>
          <h3 className={styles.head}>{t("concierge.explainTitle")}</h3>
          <p className={styles.body}>{t("concierge.explainBody")}</p>
          <p className={styles.why}>{t("concierge.explainWhy")}</p>
          <p className={styles.how}>{t("concierge.explainHow")}</p>
          <a
            className={styles.primaryLink}
            href="https://www.gs1us.org/get-a-gtin"
            target="_blank"
            rel="noreferrer"
          >
            {t("concierge.explainCta")}
          </a>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setMode("prefix")}
          >
            {t("concierge.explainRegistered")}
          </button>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => setMode("choice")}
          >
            {t("concierge.back")}
          </button>
        </div>
      )}

      {mode === "prefix" && (
        <form action={formAction} className={styles.modal} noValidate>
          <input type="hidden" name="productId" value={productId} />
          <h3 className={styles.head}>{t("concierge.prefixTitle")}</h3>

          <FormField
            styles={styles}
            htmlFor="gs1Prefix"
            label={t("concierge.prefixLabel")}
            helper={t("concierge.prefixHelper")}
          >
            <input
              id="gs1Prefix"
              name="gs1Prefix"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className={styles.input}
              placeholder={t("concierge.prefixPlaceholder")}
              aria-describedby={
                errKey ? "gs1Prefix-helper gs1Prefix-error" : "gs1Prefix-helper"
              }
              aria-invalid={errKey ? true : undefined}
            />
          </FormField>

          {errKey ? (
            <FormError
              id="gs1Prefix-error"
              message={t(`concierge.${msgKey}`)}
              className={styles.error}
            />
          ) : null}
          {"ok" in state && state.ok && (
            <p className={styles.saved}>
              {t("concierge.generated")}: <strong>{state.gtin}</strong>
            </p>
          )}

          <SubmitButton className={styles.primary} pendingLabel="…">
            {t("concierge.submit")}
          </SubmitButton>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => setMode("choice")}
          >
            {t("concierge.back")}
          </button>
        </form>
      )}
    </div>
  );
}