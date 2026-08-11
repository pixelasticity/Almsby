import { notFound } from "next/navigation";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ gtin: string }>;
}) {
  const { gtin } = await params;
  if (!/^\d{14}$/.test(gtin)) notFound();

  return (
    <section style={{ padding: 48, maxWidth: 720, margin: "0 auto" }}>
      <h1>Product story</h1>
      <p>
        Phase 0 placeholder. Full story-page rendering lands in Phase 2.
        Requested GTIN: {gtin}.
      </p>
    </section>
  );
}