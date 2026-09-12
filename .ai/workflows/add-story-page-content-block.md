# Workflow: add a story-page content block or field

Source of truth: `guidelines/delivery/phase2/dev-brief.md`. Read it in full
before starting — this workflow only sequences its guardrails, it doesn't
replace them.

**Note on drift:** an earlier version of this workflow (and an earlier
version of the Phase 2 brief) specified plain `{type: 'paragraph' | 'heading',
text}` JSON blocks with no rich-text editor at all. That's been superseded —
the current brief specifies Tiptap with a deliberately bounded schema. If you
see other guidance (code comments, older docs, prior conversation summaries)
describing the plain-blocks approach, treat `delivery/phase2/dev-brief.md` as
current and flag the stale reference rather than trusting it.

## Before touching anything

Confirm the change fits inside Phase 2's actual scope. The brief is explicit
about what NOT to build (§9) — if the request smells like any of these, stop
and flag it instead of proceeding:

- Expanding the Tiptap schema beyond `paragraph`, `heading` (h2–h6), `bold`,
  `italic`, `strike`, `link` — no tables, embeds, inline images, or arbitrary
  HTML nodes/marks without a deliberate, recorded decision.
- `dangerouslySetInnerHTML` anywhere in the story-rendering path, for any
  reason, ever. This is what makes the bounded schema an actual safety
  guarantee rather than a convention someone has to remember.
- Full drag-and-drop/page-builder customization (bounded color choices +
  header photo only, per §7).
- Translated story content (English-only for Phase 2; keep fields
  structured so translation is additive later, not a rebuild).
- Anything inside `lib/gs1/*`, the resolver's GTIN lookup logic, or
  `verify.ts` — this phase renders content for an already-resolved,
  already-verified product; it does not touch how that resolution happens.

## Steps

1. **Editor (dashboard side):** Tiptap, headless, with only the registered
   node/mark types above — never the full `@tiptap/starter-kit` if that pulls
   in unused node types. The safety property depends on the editor being
   structurally incapable of producing anything outside that set, not on a
   convention.
2. **Schema:** `StoryPage.bodyContent` is `Json?`, storing Tiptap's native
   JSON document format directly — no HTML string, no sanitizer step.
   Material/origin/recyclability fields stay on `Product`; the story page
   reads them via the join, it does not duplicate them.
3. **Rendering (public side):** write a JSON-node → React-component mapper
   (`paragraph` → `<p>`, `heading` → `<h2>`–`<h6>`, marks → inline elements).
   Every node/mark type the mapper doesn't explicitly handle should render as
   nothing (or a clearly-logged unknown-node case), never as raw HTML.
4. **Photo upload:** goes through Cloudflare R2, not Supabase Storage, and is
   a separate dedicated field — not embedded inline in body content for
   Phase 2.
5. **Publish/unpublish:** must call `revalidateTag` for the affected story
   page — required, not optional, given the ISR strategy (`revalidate =
   false` + on-demand tag revalidation). A publish that doesn't revalidate
   the tag will silently not show up.
6. **Public route (`app/(public)/s/[gtin]/page.tsx`):** an unpublished or
   nonexistent `StoryPage` renders a friendly "coming soon" state as a
   normal `200` with `<meta name="robots" content="noindex">` — never a
   404, never leaked draft content.
7. **Schema.org JSON-LD:** every published page gets the `Product`/`Brand`
   block described in the brief §6. Small effort, don't skip it.
8. **"Powered by Almsby" badge:** present and correctly linked on every
   published page — check it wasn't dropped by whatever template change
   prompted this task.

## If this task involves a genuinely new node/mark type

That's a schema-expansion decision, not a routine content task. Stop and
flag it — per `product/decisions/README.md`, a decision that changes product
behavior or a durable technical boundary should be recorded, not made
silently inside an unrelated task. Point the human at recording it alongside
(or as a successor to) whatever decision captured the original Tiptap
bounded-schema choice.

## Definition of done

Match against `guidelines/delivery/phase2/dev-brief.md` §8 line by line
before calling the task complete — don't declare done on "the form saves and
the page renders" alone if the brief's checklist has more items than that.
