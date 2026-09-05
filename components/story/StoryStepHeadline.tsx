/**
 * Step 1 of the story CMS wizard (#72): the headline.
 * Plain text input. Auto-save fires from the parent (StoryWizard) via the
 * onChange callback; this component just normalizes and forwards.
 */
"use client";

import { useTranslations } from "next-intl";
import FormField from "@/components/ui/FormField";
import styles from "./story.module.css";

export default function StoryStepHeadline({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  required: boolean;
}) {
  const t = useTranslations("story.stepHeadline");

  return (
    <FormField
      styles={styles}
      htmlFor="story-headline"
      label={t("label")}
      badge={required ? t("required") : undefined}
      helper={
        <>
          {t("helper")}
          {required ? ` — ${t("required")}` : ""}
        </>
      }
    >
      <input
        id="story-headline"
        name="headline"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("placeholder")}
        aria-describedby="story-headline-helper"
      />
    </FormField>
  );
}
