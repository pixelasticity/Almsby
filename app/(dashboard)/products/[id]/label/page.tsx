/**
 * Print-friendly dual-mark label for a product (#6, downloads in #9).
 * Browser print-to-PDF (via @media print) strips the app chrome and prints the
 * symbols at 1:1. Symbols are decode-verified per-generation before print
 * (#7); print-ready downloads and exact-size printing land in #9 below.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { toGtin14 } from "@/lib/gs1/gtin";
import {
  verifyBarcode,
  warmBarcodeVerifier,
} from "@/lib/gs1/verify";
import DualMarkLabel from "@/components/label/DualMarkLabel";
import LabelDownloads from "@/components/label/LabelDownloads";
import styles from "./label.module.css";
export default async function ProductLabelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("products");
  const user = await getCurrentUser();
  if (!user) notFound();

  let gtin14: string | null = null;
  let name = "";
  try {
    const db = getDb();
    const product = await db.product.findFirst({
      where: { id, business: { ownerId: user.id } },
      include: { gtin: true },
    });
    if (!product || !product.gtin) notFound();
    name = product.name;
    // Renderers require a GTIN-14; normalize the stored value (UPC-A/EAN-12/13) up.
    gtin14 = toGtin14(product.gtin.gtinValue);
  } catch (error) {
    // Not silent: a DB/ownership failure here must be visible to support, not
    // an unexplained 404. Log, then degrade to the 404 surface.
    console.error("[label] page load failed", id, error);
    notFound();
  }

  // Per-generation decode verification (#7's remaining half): before a maker
  // can print/download, prove every symbol round-trips through a real decoder.
  // Pre-warm the WASM once per process; the verification itself is ~1s here.
  await warmBarcodeVerifier();
  const verification = gtin14 ? await verifyBarcode(gtin14) : null;

  // Fail-closed: if ANY shipped symbol fails to decode, the label is NOT
  // usable. An absent legacy symbol (non-zero indicator digit) is a vacuous
  // pass, not a failure.
  const verified =
    verification !== null &&
    verification.qr.ok &&
    verification.dm.ok &&
    verification.legacy.ok;

  return (
    <div className={styles.page}>
      <div className={styles.noPrint}>
        <Link href={`/products/${id}`}>← {t("backToProducts")}</Link>
        <p className={styles.hint}>{t("labelPrintHint")}</p>
        {gtin14 && (
          <p
            className={
              verified
                ? styles.verifiedBadge
                : styles.failedBadge
            }
            role="status"
          >
            {verified ? t("labelVerified") : t("labelFailed")}
          </p>
        )}
      </div>
      <div className={styles.label}>
        <h1 className={styles.name}>{name}</h1>
        <DualMarkLabel gtin14={gtin14 ?? ""} />
        {gtin14 && (
          <LabelDownloads productId={id} gtin14={gtin14} verified={verified} />
        )}
      </div>
    </div>
  );
}