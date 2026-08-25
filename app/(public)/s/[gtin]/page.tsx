import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isValidGtin } from "@/lib/gs1/gtin";
import styles from "@/styles/pageShell.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gtin: string }>;
}): Promise<Metadata> {
  const { gtin } = await params;
  const t = await getTranslations("story");
  return { title: `${t("title")} · ${gtin}` };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ gtin: string }>;
}) {
  const { gtin } = await params;
  const t = await getTranslations("story");
  if (!isValidGtin(gtin)) notFound();

  return (
    <section className={styles.shell}>
      <h1>{t("title")}</h1>
      <p>{t("placeholder", { gtin })}</p>
    </section>
  );
}
