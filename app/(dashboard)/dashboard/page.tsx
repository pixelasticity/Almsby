import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("title") };
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  return (
    <section>
      <h1>{t("title")}</h1>
      <p>
        {t("placeholder")}
      </p>
      <Link href="/products">{t("goToProducts")}</Link>
    </section>
  );
}