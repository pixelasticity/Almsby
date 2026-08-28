import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import DualMarkLabel from "@/components/label/DualMarkLabel";
import styles from "./label.module.css";

/**
 * Print-friendly dual-mark label for a product (#6).
 * Browser print-to-PDF (via @media print) strips the app chrome and prints the
 * symbol at 1:1. Print-safety sized in #9; render-only here (unverified until #7).
 */
export default async function ProductLabelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("products");
  const user = await getCurrentUser();
  if (!user) notFound();

  let gtin: string | null = null;
  let name = "";
  try {
    const db = getDb();
    const product = await db.product.findFirst({
      where: { id, business: { ownerId: user.id } },
      include: { gtin: true },
    });
    if (!product || !product.gtin) notFound();
    name = product.name;
    gtin = product.gtin.gtinValue;
  } catch {
    notFound();
  }

  return (
    <div className={styles.page}>
      <div className={styles.noPrint}>
        <Link href={`/products/${id}`}>← {t("backToProducts")}</Link>
        <p className={styles.hint}>{t("labelPrintHint")}</p>
      </div>
      <div className={styles.label}>
        <h1 className={styles.name}>{name}</h1>
        <DualMarkLabel gtin14={gtin!} />
      </div>
    </div>
  );
}