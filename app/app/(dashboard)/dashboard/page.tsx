import Link from "next/link";

export default function DashboardPage() {
  return (
    <section>
      <h1>Maker dashboard</h1>
      <p>
        Phase 0 placeholder. Auth and the Business/Product flows land once
        Supabase credentials are wired — see app/README.md.
      </p>
      <Link href="/products">Go to products</Link>
    </section>
  );
}