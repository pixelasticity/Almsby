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

## ⚠️ DECISION PENDING — ISR (brief §4, §8 "ISR caching confirmed working")

**Wired and execution-proven; currently inert. The DoD line is NOT claimable yet.**

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

**Consequence today:** freshness-after-publish holds trivially (every scan
renders fresh), and a stale-page/unpublish leak cannot occur while dynamic. The
invalidation calls are no-ops that become load-bearing the moment the route is
served statically.

**Options (owner: founder — architecture call, not a code change):**
- **A — Accept dynamic for now (recommended at this scale).** Zero work. Annotate
  this DoD item rather than checking it; revisit when scan volume makes the
  per-request render cost visible.
- **B — Static migration (its own PR/phase).** Adopt next-intl's static
  rendering: `setRequestLocale` across layouts/pages plus either a cookie-free
  request config (dashboard loses cookie locale unless the locale moves into the
  URL) or URL-prefixed locales (`localePrefix: 'as-needed'` keeps `/s/{gtin}`
  canonical for English). Then re-run the HIT→MISS probe and close this item.

Do not close this on "code merged" — the DoD requires a manual verification.

## ❌ PENDING / NOT BUILT

- **Photo upload (brief §2.1).** `lib/story/storage.ts` (R2 upload, fail-loud,
  tested) has no caller: the studio has no photo UI and `StoryPage.photos` is
  never written. Needs the R2 bucket name confirmed before wiring.
- **Schema.org JSON-LD (brief §2.6).** Not emitted anywhere; the story query
  already returns `gtinValue` for it. Small separate PR, validated with Google's
  Rich Results Test.
- **Physical scan of the live story page (brief §8 item 3).** Real printed Phase 1
  label → resolver → published page, in production. Manual/founder step; the code
  path exists but CI cannot claim it.

## Out of scope (unchanged)
Compliance dashboard (Phase 3), billing (Phase 4), translated story content
(English-only per brief, content fields kept translation-ready), page-builder
customization, TipTap schema expansion, and any change to `lib/gs1/*`, the
resolver route, or `verify.ts`.
