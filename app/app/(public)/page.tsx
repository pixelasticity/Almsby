import Link from "next/link";
import styles from "./page.module.css";

export default function PublicHomePage() {
  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>Almsby</p>
      <h1 className={styles.title}>Every product has a story.</h1>
      <p className={styles.tagline}>
        One GS1-compliant barcode that keeps your products selling through
        Sunrise 2027 — and tells your customer how it&apos;s made.
      </p>
      <span className={styles.badge}>Coming soon</span>
      <div className={styles.actions}>
        <Link className={styles.primary} href="/sign-up">Sign up</Link>
        <Link className={styles.secondary} href="/sign-in">Sign in</Link>
      </div>
      <p className={styles.footnote}>Powered by GS1 Digital Link</p>
    </section>
  );
}
