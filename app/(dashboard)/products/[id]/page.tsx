import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import GtinSetup from "@/components/products/GtinSetup";
import { STATUS_I18N_KEYS, type ProductStatus } from "@/lib/products/validate";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("products");
  let title = t("title");
  try {
    // Name-only lookup for the tab title; the page render does the full
    // ownership-scoped fetch. Fall back to the generic title on any failure.
    const user = await getCurrentUser();
    if (user) {
      const db = getDb();
      const product = await db.product.findFirst({
        where: { id, business: { ownerId: user.id } },
        select: { name: true },
      });
      if (product) title = product.name;
    }
  } catch (error) {
    console.error("ProductDetailPage: metadata lookup failed", id, error);
  }
  return { title };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("products");
  const user = await getCurrentUser();

  if (!user) notFound();

  let title = "";
  let brand: string | null = null;
  let status = "";
  let gtin: string | null = null;

  try {
    const db = getDb();
    // Ownership-scoped: only products under the signed-in user's Business.
    const product = await db.product.findFirst({
      where: { id, business: { ownerId: user.id } },
      include: { gtin: true },
    });
    if (!product) notFound();
    title = product.name;
    brand = product.brand;
    status = product.status;
    gtin = product.gtin?.gtinValue ?? null;
  } catch (error) {
    console.error("ProductDetailPage: failed to load product", id, error);
    notFound();
  }

  return (
    <div className={styles.page}>
      <Link href="/products" className={styles.back}>
        <span aria-hidden="true">←</span> {t("backToProducts")}
      </Link>

      <header className={styles.head}>
        <h1>{title}</h1>
        <p className={styles.meta}>
          {brand ? `${brand} · ` : ""}
          {t(STATUS_I18N_KEYS[status as ProductStatus] ?? "statusDraft")}
        </p>
      </header>

      <section className={styles.card} aria-label={t("gtinSectionTitle")}>
        <h2 className={styles.cardTitle}>{t("gtinSectionTitle")}</h2>
        {gtin ? (
          <p className={styles.savedGtin}>
            {t("gtinSaved")}: <strong>{gtin}</strong>
          </p>
        ) : (
          <p className={styles.muted}>{t("gtinSectionEmpty")}</p>
        )}
        <div className={styles.gtinWrap}>
          <GtinSetup productId={id} existingGtin={gtin} />
        </div>
      </section>
    </div>
  );
}