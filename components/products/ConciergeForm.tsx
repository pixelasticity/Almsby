"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { conciergeAction } from "@/app/(dashboard)/products/[id]/concierge/actions";
import styles from "./ConciergeForm.module.css";

type Mode = "choice" | "explain" | "prefix";

export default function ConciergeForm({
  productId,
}: {
  productId: string;
}) {
  const [mode, setMode] = useState<Mode>("choice");
  const [state, formAction, isPending] = useActionState<
    { error?: string } | { ok: true; gtin: string },
    FormData
  >(conciergeAction, {});
  const t = useTranslations("products");
  const errKey = "error" in state ? state.error : undefined;

  // Map action error keys → i18n keys, with an explicit generic fallback
  // (next-intl would throw on an unknown key, so we never pass one blindly).
  const ERROR_KEYS: Record<string, string> = {
    missingProduct: "missingProduct",
    authRequired: "authRequired",
    productNotFound: "productNotFound",
    saveFailed: "saveFailed",
    prefixEmpty: "prefixEmpty",
    prefixNonNumeric: "prefixNonNumeric",
    prefixInvalid: "prefixInvalid",
    prefixExhausted: "prefixExhausted",
  };
  const msgKey =
    errKey && ERROR_KEYS[errKey] ? ERROR_KEYS[errKey] : "genericError";

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
          <label className={styles.label} htmlFor="gs1Prefix">
            {t("concierge.prefixLabel")}
          </label>
          <input
            id="gs1Prefix"
            name="gs1Prefix"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className={styles.input}
            placeholder={t("concierge.prefixPlaceholder")}
          />
          <p className={styles.helper}>{t("concierge.prefixHelper")}</p>

          {errKey && (
            <p role="alert" className={styles.error}>
              {t(`concierge.${msgKey}`)}
            </p>
          )}
          {"ok" in state && state.ok && (
            <p className={styles.saved}>
              {t("concierge.generated")}: <strong>{state.gtin}</strong>
            </p>
          )}

          <button
            type="submit"
            className={styles.primary}
            disabled={isPending}
          >
            {isPending ? "…" : t("concierge.submit")}
          </button>
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