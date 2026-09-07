import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { normalizeTipTapContent } from "@/lib/story/tiptap";
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

  // bodyContent is an unconstrained Json? column and may still hold the
  // legacy BlockComposer array from before the TipTap migration. Normalize it
  // into a TipTap doc here so the editor (and the mobile preview) ingest safe
  // JSON. The first Save persists the normalized form, so this is a
  // self-migrating, no-DB-migration conversion.
  const bodyContent = normalizeTipTapContent(product.storyPage?.bodyContent ?? null);

  return (
    <StoryStudio
      product={{
        id: product.id,
        name: product.name,
        gtin: product.gtin,
        countryOfOrigin: product.countryOfOrigin,
        materialComposition: product.materialComposition,
        recyclable: product.recyclable,
        storyPage: product.storyPage
          ? { id: product.storyPage.id, published: product.storyPage.published, bodyContent }
          : null,
      }}
    />
  );
}
