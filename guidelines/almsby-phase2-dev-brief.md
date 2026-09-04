# Almsby — Phase 2 Developer Brief
*Story pages — the growth engine. Turns a scanned barcode into a live, human story.*

---

## 1. Context (read this first)

Phase 1 built the spine: a barcode that scans correctly, resolves to the right GTIN, on real hardware, in print. Phase 2 builds the reason a consumer cares — the page that barcode actually opens.

**This phase is lower-stakes than Phase 1 in one sense (a typo in story copy doesn't fail at checkout) and higher-stakes in another (this is the only part of Almsby an end consumer ever sees).** The resolver, GTIN correctness, and decode verification are all already proven — don't touch them. This phase is additive: give the resolver a real destination instead of a placeholder.

Full technical grounding lives in the architecture doc (Sections 2, 6, 8) and the engineering roadmap (Phase 2 section). This brief is the actionable spec.

**Read `AGENTS.md` before starting.** The HIGH-RISK zones (resolver route logic, `lib/gs1/*`, `verify.ts`) still apply — this phase adds *content* to what the resolver serves, it does not modify GTIN lookup, barcode generation, or verification logic.

---

## 2. What ships in this phase

1. Story page CMS (dashboard-side content editing)
2. Public story page rendering at the resolver-linked route
3. "Powered by Almsby" badge (referral loop, per GTM plan)
4. Light-touch brand customization (colors/template, no design skill required)
5. Publish/unpublish flow
6. Schema.org structured data on published story pages (Section 6, Layer 1 — AI/crawler accessibility)

**Explicitly not in this phase:** compliance dashboard (Phase 3), billing (Phase 4), multi-language story content (i18n framework exists per architecture doc Section 8, but translated *content* is a later rollout per the language tier list — ship English-only story pages now, structure content fields so translation is additive later, not a rebuild).

---

## 3. Data model

`StoryPage` already exists as a scaffolded Prisma model per the architecture doc (currently unused). This phase gives it real writes and reads.

```prisma
model StoryPage {
  id          String   @id @default(cuid())
  productId   String   @unique
  product     Product  @relation(fields: [productId], references: [id])
  headline    String?
  bodyContent Json?     // structured content blocks — see section 4
  photos      String[]  // R2 object URLs
  published   Boolean  @default(false)
  updatedAt   DateTime @updatedAt
}
```

**Migration note:** `bodyContent` is `Json?` — if `schema.prisma` currently has this as `String?`, that's a required migration in this phase, not a discrepancy to resolve by changing the design.

**Recyclability and material fields belong on `Product`** (`recyclable`, `recycling_instructions`, `takeback_program`, `material_composition`, `sourcing_notes`, `country_of_origin`) — the story page reads these from the linked Product, it does not duplicate them onto `StoryPage`. Single source of truth stays on `Product`.

**Schema gap to close in this phase's migration:** `material_composition` and `country_of_origin` were implemented in Phase 1. `recyclable`, `recycling_instructions`, `takeback_program`, and `sourcing_notes` were scoped into Phase 1 (architecture doc + Phase 1 brief) but did not land in the actual schema during Phase 1 build. Add them now as part of this phase's migration — this is closing a Phase 1 gap, not new Phase 2 scope. Flag as such in the PR description.

---

## 4. Story page CMS (dashboard side)

**Content fields, per MVP scope:**
```
headline         (short, required to publish)
bodyContent      (structured blocks — origin story, maker's own words; keep simple for MVP: a small array of {type: 'paragraph' | 'heading', text: string} is sufficient, do not build a full rich-text editor)
photos           (array of R2 URLs, uploaded via dashboard)
```

**Build:**
- A form on the product detail page (same location pattern as the GTIN card from Phase 1) — "Story Page" section
- Photo upload → Cloudflare R2, per architecture doc's storage decision (zero egress fees matters here specifically — this is the highest-traffic surface in the product)
- Publish/unpublish toggle — a `StoryPage` with `published: false` should show a "coming soon" state at the public route (see Section 5 — never a 404, DoD requires no error state for a real scanned product)
- **Publish/unpublish must call `revalidateTag` for the affected story page** — required, not optional, given the ISR strategy in Section 5. Without this, published changes won't appear until the cache naturally expires.

**Do not build a WYSIWYG/rich-text editor for Phase 2.** A small number of structured block types (paragraph, heading) is sufficient for MVP and avoids a substantial, unnecessary scope increase. Revisit only if real customer feedback demands it.

---

## 5. Public story page rendering

**Route:** `app/(public)/s/[gtin]/page.tsx` — this route already exists as a placeholder per Phase 1; this phase gives it real content.

**Requirements:**
- ISR-cached, `revalidate = false` + on-demand tag revalidation — confirmed strategy for this traffic pattern (read-heavy, write-rare). Publish/unpublish actions must trigger `revalidateTag`, per Section 4.
- Renders `StoryPage` content joined with `Product` fields (material, origin, recyclability) — the "passport" data
- **If `published: false` or no `StoryPage` exists yet → render a friendly "coming soon" state as a normal `200`, never an error.** Add `<meta name="robots" content="noindex">` on this state specifically — gets both the friendly consumer experience and prevents draft content from being indexed. Do not 404.
- "Powered by Almsby" badge, linking back to almsby.com — per GTM plan's referral-loop mechanic. Small, tasteful, not intrusive — this is a trust signal for the consumer and a growth channel for Almsby, not an ad.

**Resolver redirect: kept as-is for this phase, not eliminated.** The Phase 1 resolver's redirect to `/s/{gtin}` adds a round-trip, flagged in Phase 1 as a known tradeoff to revisit once real scan volume exists. That volume doesn't exist yet, and eliminating the redirect would mean modifying the resolver route (a HIGH-RISK zone) to also handle content rendering — which breaks the clean boundary this brief depends on (see Section 9). Do not touch `app/01/[gtin]/route.ts` in this phase.

**What this route must NOT do:** construct or validate the GTIN, touch the resolver's lookup logic, or duplicate any `lib/gs1/*` logic. It receives a valid GTIN (already resolved and verified by the Phase 1 resolver route) and renders content for it. Keep the boundary clean.

```typescript
// app/(public)/s/[gtin]/page.tsx — shape, not final code
export const revalidate = false; // ISR — revalidate via on-demand tag, not time-based polling

export default async function StoryPage({ params }: { params: { gtin: string } }) {
  const product = await getProductWithStoryByGtin(params.gtin); // reads Product + StoryPage join
  if (!product?.storyPage?.published) {
    return <ComingSoon />;
  }
  return <PublishedStory product={product} />;
}
```

---

## 6. Schema.org structured data

Per architecture doc Section 6, Layer 1. Add to every published story page's `<head>`:

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  brand: { '@type': 'Brand', name: product.brand },
  gtin14: product.gtin.gtinValue,
  countryOfOrigin: product.countryOfOrigin,
  material: product.materialComposition,
};
```

Low effort, real return (search visibility, AI crawler legibility) — don't skip this to save time, it's small.

---

## 7. Brand customization (light-touch)

Per MVP scope: template-based, no design skill required. **For Phase 2, this means:**
- A small set of accent-color options a maker can pick from (not a full color picker — bounded choices prevent bad-looking combinations)
- Logo/photo upload for a header image
- That's it. Do not build a page-builder or drag-and-drop customization system. This is explicitly out of scope per the MVP doc's guardrails, and building it now would be exactly the kind of scope creep the roadmap has repeatedly flagged against.

---

## 8. Definition of done for Phase 2

- [ ] A maker can create story page content (headline, body, photos) for a product with an existing GTIN
- [ ] Publishing makes the story live at the resolver-linked public URL; unpublishing removes it (or shows "coming soon")
- [ ] Scanning a real, printed Phase 1 barcode loads the published story page in production — end to end, no manual steps
- [ ] Story page displays product's material/origin/recyclability data correctly, pulled from `Product`, not duplicated
- [ ] "Powered by Almsby" badge present and linked correctly on every published page
- [ ] Schema.org JSON-LD present and valid (test with Google's Rich Results Test) on published pages
- [ ] Unpublished/nonexistent story pages show a friendly state, never an error or leaked draft content
- [ ] ISR caching confirmed working — page updates reflect after publish without a full rebuild

---

## 9. Explicit guardrails — what NOT to build in Phase 2

- No rich-text/WYSIWYG editor — structured blocks only
- No full design/page-builder customization — bounded color choices + photo only
- No compliance dashboard or aggregation logic (Phase 3)
- No billing/Stripe integration (Phase 4)
- No translated story content — English only, but keep content fields structured so translation is additive later (per architecture doc Section 8's dashboard/story-page decoupling)
- **Do not modify `lib/gs1/*`, the resolver's GTIN lookup logic, or `verify.ts`.** This phase renders content for an already-resolved, already-verified product. If something here seems like it needs a change, that's a signal to stop and check in, not proceed.

If a developer finds themselves building any of the above "while they're in there," that's the signal to stop and check in — same discipline as every prior phase.
