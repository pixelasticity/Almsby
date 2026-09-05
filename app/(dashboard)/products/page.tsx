import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { statusI18nKey } from "@/lib/products/validate";
import ProductForm from "@/components/products/ProductForm";
import styles from "./products.module.css";

type ListProduct = { id: string; name: string; status: string };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");
  return { title: t("title") };
}

export default async function ProductsPage() {
  const t = await getTranslations("products");
  // Auth guard: an expired session redirects to /sign-in instead of showing
  // an empty list that looks like "no products yet" (#83).
  const user = await requireAuth();
  let products: ListProduct[] = [];
  let loadError = false;

  try {
    const db = getDb();
    // Single ownership-scoped query via the Business relation.
    products = await db.product.findMany({
      where: { business: { ownerId: user.id } },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, status: true },
    });
  } catch (error) {
    console.error("ProductsPage: failed to list products", error);
    loadError = true;
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>{t("title")}</h1>
        <p>{t("createSub")}</p>
      </header>

      <ProductForm />

      <section className={styles.list} aria-label={t("listTitle")}>
        <h2>{t("listTitle")}</h2>
        {loadError && <p className={styles.error}>{t("listError")}</p>}
        {!loadError && products.length === 0 && (
          <p className={styles.muted}>{t("empty")}</p>
        )}
        {!loadError && products.length > 0 && (
          <ul className={styles.items}>
            {products.map((p) => (
              <li key={p.id} className={styles.item}>
                <Link href={`/products/${p.id}`} className={styles.itemName}>
                  {p.name}
                </Link>
                <span className={styles.itemStatus}>
                  {t(statusI18nKey(p.status))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}