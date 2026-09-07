import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import StoryStudio from "@/components/story-studio/StoryStudio";

export default async function StoryStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = await params;
  const user = await requireAuth();

  // Ownership-scoped: only the product owner reaches the studio. Fetches the
  // fields the studio displays (GTIN, passport data, story page) in one query.
  const db = getDb();
  const product = await db.product.findFirst({
    where: { id: productId, business: { ownerId: user.id } },
    include: {
      gtin: { select: { gtinValue: true } },
      storyPage: { select: { id: true, published: true, bodyContent: true } },
    },
  });

  if (!product) notFound();

  return (
    <StoryStudio
      product={{
        id: product.id,
        name: product.name,
        gtin: product.gtin,
        countryOfOrigin: product.countryOfOrigin,
        materialComposition: product.materialComposition,
        recyclable: product.recyclable,
        storyPage: product.storyPage,
      }}
    />
  );
}
