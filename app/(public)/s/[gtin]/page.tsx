import { notFound } from "next/navigation";
import styles from "@/styles/pageShell.module.css";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ gtin: string }>;
}) {
  const { gtin } = await params;
  if (!/^\d{14}$/.test(gtin)) notFound();

  return (
    <section className={styles.shell}>
      <h1>Product story</h1>
      <p>
        Phase 0 placeholder. Full story-page rendering lands in Phase 2.
        Requested GTIN: {gtin}.
      </p>
    </section>
  );
}