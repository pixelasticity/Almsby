import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import styles from "@/styles/pageShell.module.css";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ gtin: string }>;
}) {
  const { gtin } = await params;
  const t = await getTranslations("story");
  if (!/^\d{14}$/.test(gtin)) notFound();

  return (
    <section className={styles.shell}>
      <h1>{t("title")}</h1>
      <p>{t("placeholder", { gtin })}</p>
    </section>
  );
}