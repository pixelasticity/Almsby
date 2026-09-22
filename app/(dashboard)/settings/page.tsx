import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Breadcrumbs from "@/components/dashboard/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const tNav = await getTranslations("nav");
  return (
    <section>
      <Breadcrumbs
        items={[
          { label: tNav("dashboard"), href: "/dashboard" },
          { label: t("title") },
        ]}
      />
      <h1>{t("title")}</h1>
      <p>{t("placeholder")}</p>
    </section>
  );
}
