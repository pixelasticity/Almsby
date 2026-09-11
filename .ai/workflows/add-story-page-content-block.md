# Workflow: add a story-page content block or field

Source of truth: `guidelines/almsby-phase2-dev-brief.md`. Read it in full
before starting — this workflow only sequences its guardrails, it doesn't
replace them.

## Before touching anything

Confirm the change fits inside Phase 2's actual scope. The brief is explicit
about what NOT to build (§9) — if the request smells like any of these, stop
and flag it instead of proceeding:

- A rich-text/WYSIWYG editor (structured `{type: 'paragraph' | 'heading',
  text}` blocks only, per §4)
- Full drag-and-drop/page-builder customization (bounded color choices +
  header photo only, per §7)
- Translated story content (English-only for Phase 2; keep fields
  structured so translation is additive later, not a rebuild)
- Anything inside `lib/gs1/*`, the resolver's GTIN lookup logic, or
  `verify.ts` — this phase renders content for an already-resolved,
  already-verified product; it does not touch how that resolution happens.

## Steps

1. **Schema:** `StoryPage.bodyContent` is `Json?` — a small array of
   `{type: 'paragraph' | 'heading', text: string}` blocks. Do not widen this
   shape without checking in first; it's deliberately minimal per §4.
   Material/origin/recyclability fields belong on `Product`, not duplicated
   onto `StoryPage` — read from the join, don't copy.
2. **CMS side (dashboard):** form lives alongside the GTIN card pattern on
   the product detail page. Photo upload goes through Cloudflare R2, not
   Supabase Storage (architecture doc §1 — zero egress fees matters
   specifically because story pages are the highest-traffic surface).
3. **Publish/unpublish:** must call `revalidateTag` for the affected story
   page — required, not optional, given the ISR strategy (`revalidate =
   false` + on-demand tag revalidation). A publish that doesn't revalidate
   the tag will silently not show up.
4. **Public route (`app/(public)/s/[gtin]/page.tsx`):** an unpublished or
   nonexistent `StoryPage` renders a friendly "coming soon" state as a
   normal `200` with `<meta name="robots" content="noindex">` — never a
   404, never leaked draft content.
5. **Schema.org JSON-LD:** every published page gets the `Product`/`Brand`
   block described in the brief §6. Small effort, don't skip it to save
   time.
6. **"Powered by Almsby" badge:** present and correctly linked on every
   published page (GTM referral-loop mechanic) — check it wasn't dropped
   by whatever template change prompted this task.

## Definition of done

Match against `guidelines/almsby-phase2-dev-brief.md` §8 line by line before
calling the task complete — don't declare done on "the form saves and the
page renders" alone if the brief's checklist has more items than that.
