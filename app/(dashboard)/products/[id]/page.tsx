import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { getOwnedProduct } from "@/lib/products/queries";
import { toGtin14 } from "@/lib/gs1/gtin";
import GtinSetup from "@/components/products/GtinSetup";
import DualMarkLabel from "@/components/label/DualMarkLabel";
import { statusI18nKey } from "@/lib/products/validate";
import styles from "./page.module.css";
import storyStyles from "./story-entry.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("products");
  let title = t("title");
  try {
    // Falls back to the generic title on any failure.
    const user = await getCurrentUser();
    if (user) {
      const product = await getOwnedProduct(id, user.id);
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
    // Ownership-scoped: only products under the signed-in user's Business.
    const product = await getOwnedProduct(id, user.id);
    if (!product) notFound();
    title = product.name;
    brand = product.brand;
    status = product.status;
    gtin = product.gtin?.gtinValue ?? null;
  } catch (error) {
    console.error("ProductDetailPage: failed to load product", id, error);
    notFound();
  }

  // DualMarkLabel's renderers require a GTIN-14; normalize the stored value
  // (a UPC-A/EAN-12/13) up to 14 digits. If it can't normalize, the card hides.
  const gtin14 = gtin ? toGtin14(gtin) : null;

  return (
    <div className={styles.page}>
      <Link href="/products" className={styles.back}>
        <span aria-hidden="true">←</span> {t("backToProducts")}
      </Link>

      <header className={styles.head}>
        <h1>{title}</h1>
        <p className={styles.meta}>
          {brand ? `${brand} · ` : ""}
          {t(statusI18nKey(status))}
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
        {gtin14 && (
          <>
            <div className={styles.barcodeCard}>
              <h3 className={styles.cardTitle}>{t("barcodeSectionTitle")}</h3>
              <DualMarkLabel gtin14={gtin14} />
              <p className={styles.unverifiedNote}>
                {t("barcodeUnverifiedNote")}
              </p>
              <Link href={`/products/${id}/label`} className={styles.printLink}>
                {t("labelPrintLink")}
              </Link>
            </div>
          </>
        )}
        <div className={styles.gtinWrap}>
          <GtinSetup productId={id} existingGtin={gtin} />
        </div>
      </section>

      <StoryEntry productId={id} />
    </div>
  );
}


/**
 * Entry point for the Story Studio: shows the story publish status and
 * links to /products/[id]/studio. Renders the entry link ALWAYS — a missing
 * StoryPage row means the maker has not started a story yet, but the link
 * still shows (the studio handles the empty state). The publish status is
 * shown only once a story row exists. Failures log loud but degrade to a
 * card with no status line (never hides the entry point).
 */
async function StoryEntry({ productId }: { productId: string }) {
  const t = await getTranslations("story");

  let published: boolean | undefined;
  try {
    const db = getDb();
    const storyPage = await db.storyPage.findUnique({
      where: { productId },
      select: { published: true },
    });
    published = storyPage?.published;
  } catch (error) {
    console.error("StoryEntry: failed to load story status", productId, error);
  }

  return (
    <section className={storyStyles.card} aria-label={t("title")}>
      <h2 className={styles.cardTitle}>{t("title")}</h2>
      {published !== undefined && (
        <p className={storyStyles.status}>
          {published ? t("statusPublished") : t("statusDraft")}
        </p>
      )}
      <Link href={`/products/${productId}/studio`} className={storyStyles.link}>
        {t("edit")}
      </Link>
    </section>
  );
}
