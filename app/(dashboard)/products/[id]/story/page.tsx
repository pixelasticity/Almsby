/*
 * Phase 2 — CMS form for the story page (#72).
 * Server-side page: loads the product's existing story (if any) and ownership,
 * then hands off to the client wizard component.
 */
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/server";
import StoryWizard from "./StoryWizardClient";
import { parseBodyContent } from "@/lib/story/validate";
import type { StoryBlock } from "@/lib/story/queries";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  // Ownership check at the route level — only the product owner sees this.
  // Server actions (story/actions.ts) re-check ownership server-side too.
  const db = getDb();
  const product = await db.product.findFirst({
    where: { id: productId, business: { ownerId: user.id } },
    include: {
      storyPage: true,
    },
  });
  if (!product) notFound();

  const existing = product.storyPage
    ? {
        headline: product.storyPage.headline,
        // bodyContent is a stored JsonValue; parseBodyContent validates it into
        // typed blocks (and tolerates an already-parsed array). A malformed
        // stored value degrades to an empty editor, never a crashed page.
        bodyContent: safeParseStoredBody(productId, product.storyPage.bodyContent),
        photos: product.storyPage.photos,
        published: product.storyPage.published,
      }
    : null;

  return <StoryWizard productId={productId} existing={existing} />;
}

/**
 * Stored bodyContent → validated StoryBlock[]. Logs loud on malformed data
 * (a corrupted row is a support-visible bug) but degrades to [] so the
 * wizard still opens — the maker can re-save and heal the row.
 */
function safeParseStoredBody(productId: string, raw: unknown): StoryBlock[] {
  try {
    return parseBodyContent(raw);
  } catch (error) {
    console.error("StoryPage: stored bodyContent failed validation", productId, error);
    return [];
  }
}
