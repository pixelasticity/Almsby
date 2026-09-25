/**
 * The consumer-facing story page — the page a scanned barcode actually opens.
 *
 * PUBLIC INPUTS ONLY (load-bearing): this route reads `params`, the public
 * story query, and translations — and nothing session-scoped. A single
 * getCurrentUser()/cookies()/headers() call here would opt the route into
 * dynamic rendering and silently kill `revalidate = false` below (no error,
 * just every scan hitting Postgres). Future edits: do not add session reads.
 *
 * ISR per Phase 2 brief §4 ("required, not optional"): revalidate = false states
 * the intent, and save/publish bust the route via revalidatePath — BUT the
 * route currently renders DYNAMIC anyway (verified: private/no-store, no cache
 * events even with the locale cookie removed), so today every scan is fresh
 * and the invalidation calls are inert no-ops. Making it actually static is an
 * i18n-architecture question (cookie-locale + next-intl setRequestLocale were
 * never adopted repo-wide) — the decision is recorded in
 * guidelines/delivery/phase2/dod-status.md (§ISR): accepted as dynamic for now
 * (option A), with the revisit trigger for a static migration. Not a bug in
 * this file. Do not add session reads regardless (they'd lock dynamic forever).
 *
 * Draft safety: an unpublished or unknown story renders Coming Soon as a
 * normal 200 with noindex — never a 404, never a leaked draft (brief §5).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isValidGtin, toGtin14 } from "@/lib/gs1/gtin";
import { getProductWithStoryByGtin } from "@/lib/story/queries";
import { normalizeTipTapContent } from "@/lib/story/tiptap";
import TipTapRenderer from "@/components/story-page/TipTapRenderer";
import ComingSoon from "@/components/story-page/ComingSoon";
import PassportSummary from "@/components/story-studio/PassportSummary";
import { env } from "@/lib/env";
import shellStyles from "@/styles/pageShell.module.css";
import styles from "./page.module.css";

export const revalidate = false; // Indefinite Data Cache; revalidatePath clears it on publish.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gtin: string }>;
}): Promise<Metadata> {
  const { gtin } = await params;
  const t = await getTranslations("story");
  // Coming-soon (unpublished, unknown, malformed): indexable only when real
  // content is live — draft and placeholder states must never be crawled.
  if (!isValidGtin(gtin)) return { title: t("title"), robots: { index: false } };
  const product = await getProductWithStoryByGtin(toGtin14(gtin)!);
  if (!product?.storyPage?.published) {
    return { title: t("title"), robots: { index: false } };
  }
  return { title: product.storyPage.headline || product.name };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ gtin: string }>;
}) {
  const { gtin } = await params;
  const t = await getTranslations("story");
  if (!isValidGtin(gtin)) notFound();

  const product = await getProductWithStoryByGtin(toGtin14(gtin)!);
  const story = product?.storyPage;

  // Unknown GTIN OR unpublished story → the same friendly 200 state (brief
  // §5): no error, no 404 for a well-formed identifier, no draft fields shown.
  if (!product || !story?.published) {
    return (
      <section className={shellStyles.shell}>
        <ComingSoon
          title={t("comingSoonTitle")}
          body={t("comingSoonBody")}
          styles={styles}
        />
      </section>
    );
  }

  // Normalize the unconstrained Json? body here (legacy BlockComposer arrays
  // self-migrate to TipTap docs) — the renderer never sees raw stored shapes.
  const body = normalizeTipTapContent(story.bodyContent);

  return (
    <section className={shellStyles.shell}>
      <h1 className={styles.headline}>{story.headline || product.name}</h1>
      {body && (
        <div className={styles.body}>
          <TipTapRenderer content={body} />
        </div>
      )}
      {/* Single source of truth for passport field display: the SAME component
          the studio preview renders, reading the passport.* keys. */}
      <PassportSummary product={product} />
      {/* Referral-loop badge (GTM plan): links to the app origin — a NON
          Digital-Link URL, so it comes from NEXT_PUBLIC_APP_URL via env.appUrl,
          never NEXT_PUBLIC_RESOLVER_URL (AGENTS.md rule 3). */}
      <a className={styles.badge} href={env.appUrl}>
        {t("poweredBy")}
      </a>
    </section>
  );
}
