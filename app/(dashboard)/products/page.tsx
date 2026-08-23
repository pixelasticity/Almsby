import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import ProductForm from "@/components/products/ProductForm";
import styles from "./products.module.css";

type ListProduct = { id: string; name: string; status: string };

const STATUS_KEYS: Record<string, string> = {
  draft: "statusDraft",
  active: "statusActive",
  archived: "statusArchived",
};

export default async function ProductsPage() {
  const t = await getTranslations("products");
  const user = await getCurrentUser();
  let products: ListProduct[] = [];
  let loadError = false;

  if (user) {
    try {
      const db = getDb();
      const business = await db.business.findFirst({
        where: { ownerId: user.id },
      });
      if (business) {
        products = await db.product.findMany({
          where: { businessId: business.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, status: true },
        });
      }
    } catch (error) {
      console.error("ProductsPage: failed to list products", error);
      loadError = true;
    }
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
                <span className={styles.itemName}>{p.name}</span>
                <span className={styles.itemStatus}>
                  {t(STATUS_KEYS[p.status] ?? "statusDraft")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}