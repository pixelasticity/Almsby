# Phase 2 — Definition of Done status tracker

Mirrors `guidelines/delivery/phase2/dev-brief.md` §8. Update as items close;
the brief itself stays immutable as the spec. Last reviewed: 2026-09-24.

---

## ✅ DONE (code)

### Story page CMS (brief §2.1)
Studio at `/products/[id]/studio`: constrained TipTap editor, dedicated headline
column, save/publish, passport panel, mobile preview. Writes gated by session +
ownership and validated before persistence (TipTap shape + link-href allowlist).
Covered by `tests/story/studio-actions.test.ts`, `mark-utils`, `tiptap` suites.

### Publish / unpublish (brief §2.5)
`published` round-trips end to end; unpublish returns the page to the friendly
state. **Headline is required to publish** (brief §5) — enforced in
`publishStoryAction`; drafts still save without one.

### Public story page (brief §2.2, §5)
`/s/[gtin]` renders published stories (headline, TipTap body — legacy
BlockComposer rows normalize on read — passport block, badge). Unpublished or
unknown GTINs render Coming Soon as a normal 200 with `robots: noindex`; no
404s, no leaked draft fields. The Coming Soon block is the SAME component the
studio preview renders (`components/story-page/ComingSoon.tsx`) so preview and
public output cannot drift.

### "Powered by Almsby" badge (brief §2.3)
Present on every published page; `href` comes from `env.appUrl` (app origin —
never the resolver domain, AGENTS.md rule 3).

### Passport fields from `Product` (brief §8)
Public page reuses the studio's `PassportSummary` — single source of truth for
gtin / origin / material / recyclable display, read from `Product`, not
duplicated onto `StoryPage`.

### Crawler signals — canonical URL + Schema.org JSON-LD (brief §2.6, §6)
Published pages now emit `<link rel="canonical">` and Schema.org Product JSON-LD.

- **Canonical** (`lib/story/url.ts`): anchored to the **resolver host**, because
  that is where scans and shared barcode links land, and it is the domain that
  cannot move (AGENTS.md rule 3) while `NEXT_PUBLIC_APP_URL` may change freely.
  Unpublished pages emit none — they are already `robots: noindex`, and a
  canonical would advertise a URL that must not be indexed.
- **JSON-LD** (`lib/story/jsonLd.ts`): brief §6 fields exactly (name, brand,
  gtin14, countryOfOrigin, material). Unset Product fields are omitted, never
  emitted as null/"" — "no origin stated" is a different claim from "origin is
  empty". Escaping (`<` → `\u003c`) is proven against a `</script>` payload in
  `tests/story/json-ld.test.ts`, so the tag cannot be broken out of.
- Path shape is single-sourced (`storyPagePath`), shared by the canonical URL
  and the studio's "View live story" link.

**FLAGGED — deliberate exception to AGENTS.md rule 3, needs your blessing on
the wording:** rule 3 scopes `NEXT_PUBLIC_RESOLVER_URL` to GS1 Digital Link
URIs. The canonical is not a Digital Link URI — it is the resolver *host*, used
to anchor content that is canonically served there. Approved in conversation
(2026-09-24) and implemented with the reasoning in code; the AGENTS rule text
has NOT been amended, so the file and the exception currently disagree on
paper. Suggested carve-out if you agree: "…or to construct canonical URLs for
content served on the resolver domain."

**Adjacent gap noted, deliberately not touched:** `app/layout.tsx` sets no
`metadataBase`. This page does not need one — its canonical is absolute — but
the first relative Open Graph image or relative alternate elsewhere will, and a
repo-wide `metadataBase` decision belongs with that change, not smuggled in
here.

**Manual verification still owed (founder):** the DoD asks for the Google Rich
Results Test. Expect it to report **no eligible rich results** — Google's
Product rich result requires `offers` (or `review`/`aggregateRating`), and a
passport page has no price. That is not a defect and not a reason to invent an
offer: brief §6 / architecture §6 Layer 1 is about *machine legibility* (AI
crawlers, agents), which is what the markup delivers. Record the actual tool
output before ticking that line.



**Decision: Option A — accept dynamic rendering for now** (founder, 2026-09-24).
This DoD line stays **OPEN, annotated — not checked**: the brief asks for ISR
caching and the route demonstrably does not cache. "Code-done" for the
invalidation wiring is true; "phase-done" for this item is not.

Rationale: at current scan volume a per-request render is invisible in latency
and cost, and dynamic rendering satisfies the DoD's underlying intent —
"page updates reflect after publish without a full rebuild" — trivially, with
zero stale-page risk (no stale window can exist when nothing is cached).

Evidence (local probes, 2026-09-24, `next build` + `next start` +
`NEXT_PRIVATE_DEBUG_CACHE=1`):

- The route carries `revalidate = false`, and save/publish/unpublish call
  `revalidatePath` (both route-group spellings) after each committed write only.
- Probe: both spellings reach the cache layer as
  `_N_T_/(public)/s/[gtin]/page` and `_N_T_/s/[gtin]/page` tags — batched, no errors.
- BUT the route renders **dynamically per request**: `Cache-Control: private,
  no-cache, no-store`, zero cache events. Re-running with the locale cookie
  removed from `i18n/request.ts` changed nothing, so cookie-locale is not the
  sole cause; the never-adopted next-intl static pattern (`setRequestLocale` is
  called nowhere) is the remaining suspect.

**Revisit trigger (when to do Option B):** scan volume makes the per-request
render visible in latency or cost, or custom-domain support lands (each domain
multiplies rendered scans). Option B = next-intl static rendering:
`setRequestLocale` across layouts/pages, plus either a cookie-free request
config (the dashboard loses cookie locale unless the locale moves into the URL)
or URL-prefixed locales (`localePrefix: 'as-needed'` keeps `/s/{gtin}` canonical
for English). Then re-run the HIT→MISS probe above and close this item.

## ❌ PENDING / NOT BUILT

- **Photo upload (brief §2.1).** `lib/story/storage.ts` (R2 upload, fail-loud,
  tested) has no caller: the studio has no photo UI and `StoryPage.photos` is
  never written. Needs the R2 bucket name confirmed before wiring.
- **Physical scan of the live story page (brief §8 item 3).** Real printed Phase 1
  label → resolver → published page, in production. Manual/founder step; the code
  path exists but CI cannot claim it.

## Out of scope (unchanged)
Compliance dashboard (Phase 3), billing (Phase 4), translated story content
(English-only per brief, content fields kept translation-ready), page-builder
customization, TipTap schema expansion, and any change to `lib/gs1/*`, the
resolver route, or `verify.ts`.
