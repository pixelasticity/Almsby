"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createProductAction } from "@/app/(dashboard)/products/actions";
import FormError from "@/components/ui/FormError";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
import styles from "./ProductForm.module.css";

export default function ProductForm() {
  const [state, formAction] = useActionState(createProductAction, undefined);
  const t = useTranslations("products");

  return (
    <form action={formAction} className={styles.form} noValidate>
      <h2 className={styles.title}>{t("createTitle")}</h2>

      <FormField
        styles={styles}
        htmlFor="name"
        label={t("nameLabel")}
        badge={t("nameRequired")}
        helper={t("nameHelper")}
      >
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder={t("nameHelper")}
          className={styles.input}
          aria-describedby="name-helper"
        />
      </FormField>

      <FormField
        styles={styles}
        htmlFor="brand"
        label={t("brandLabel")}
        badge={t("optional")}
        helper={t("brandHelper")}
      >
        <input
          id="brand"
          name="brand"
          type="text"
          placeholder={t("brandHelper")}
          className={styles.input}
          aria-describedby="brand-helper"
        />
      </FormField>

      <FormField
        styles={styles}
        htmlFor="netContent"
        label={t("netContentLabel")}
        badge={t("optional")}
        helper={t("netContentHelper")}
      >
        <input
          id="netContent"
          name="netContent"
          type="text"
          placeholder={t("netContentHelper")}
          className={styles.input}
          aria-describedby="netContent-helper"
        />
      </FormField>

      <FormField
        styles={styles}
        htmlFor="countryOfOrigin"
        label={t("countryLabel")}
        badge={t("optional")}
        helper={t("countryHelper")}
      >
        <input
          id="countryOfOrigin"
          name="countryOfOrigin"
          type="text"
          placeholder={t("countryHelper")}
          className={styles.input}
          aria-describedby="countryOfOrigin-helper"
        />
      </FormField>

      <FormField
        styles={styles}
        htmlFor="materialComposition"
        label={t("materialLabel")}
        badge={t("optional")}
        helper={t("materialHelper")}
      >
        <input
          id="materialComposition"
          name="materialComposition"
          type="text"
          placeholder={t("materialHelper")}
          className={styles.input}
          aria-describedby="materialComposition-helper"
        />
      </FormField>

      <FormField
        styles={styles}
        htmlFor="status"
        label={t("statusLabel")}
        helper={t("statusHelper")}
      >
        <select
          id="status"
          name="status"
          className={styles.input}
          defaultValue="draft"
          aria-describedby="status-helper"
        >
          <option value="draft">{t("statusDraft")}</option>
          <option value="active">{t("statusActive")}</option>
          <option value="archived">{t("statusArchived")}</option>
        </select>
      </FormField>

      <FormError message={state?.error} className={styles.error} />

      <SubmitButton className={styles.submit}>{t("submit")}</SubmitButton>
    </form>
  );
}
