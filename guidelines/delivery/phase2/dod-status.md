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

### Photo upload (brief §2.1)
The studio's Photos section: heading, helper copy, a count line ("N photos" /
"Uploading N photos…") that appears only once there is something to count, a
drag-and-drop dropzone, and thumbnail previews in a grid that fits **up to 4
columns** (2 on phones).

- **Client-side compression first** (`lib/story/clientCompress.ts`). A phone
  photo (8–20 MB) is downscaled to a 2560px long edge and re-encoded in the
  browser, so `MAX_PHOTO_BYTES` (5 MB) stays a strict server contract instead of
  a wall the maker hits. A file already under 4.5 MB passes through
  **byte-identical**; a re-encode that would grow the file is discarded; a decode
  timeout stops a corrupt file from spinning forever; any failure is logged and
  falls back to the original — server validation, never this module, is the
  boundary.
- **Server Action body limit raised to 6 MB** (`next.config.ts`). The framework
  default is 1 MB, which would have rejected a legitimate compressed photo with a
  framework error instead of our user-safe message.
- **Upload-on-select, persist-on-save.** The photo is written to R2 as soon as it
  is chosen (so the maker sees the real stored image, not a fake local preview),
  and the URL joins `StoryPage.photos` on the next Save/Publish — the same model
  as headline and body. Dirty tracking was extended to photos, plus a
  photo-specific "not saved yet" note.
- **Write-side URL gate** (`lib/story/photos.ts`). Only
  `https://{R2_PUBLIC_DOMAIN}/story-photos/…` URLs are storable; off-domain,
  scheme-trick (`javascript:`, `data:`, protocol-relative, `http:`) and
  non-string entries are refused and logged, with a 12-photo cap. The public page
  renders these as `<img src>`, so this is the same "refuse on write what the
  render path would otherwise neutralize" discipline as the TipTap link allowlist.
- **One shared `PhotoGallery`** renders the studio preview AND the public page in
  the same slot (directly under the headline), so preview parity is structural
  rather than a convention.
- **VERIFIED LIVE** (2026-09-24, dev bucket `almsby-story-photos-dev`, real
  credentials via `.env.local`): uploaded a real PNG → returned
  `https://pub-…r2.dev/story-photos/tmp-live-check/…-live-check.png` → `fetch`
  **200 `image/png`**. Bucket name, key shape, public domain and content type
  confirmed against real R2, not mocks. (One throwaway object now sits in the dev
  bucket — see the orphan-cleanup follow-up.)
- **Tests:** `tests/story/photos.test.ts` (URL gate, cap, duplicates, scheme
  tricks), `tests/story/client-compress.test.ts` (dimension math, passthrough,
  oversized-source refusal, decode-failure fallback), and photo cases added to
  `tests/story/studio-actions.test.ts` (photo persistence on save/publish, URL
  refusal, cap, upload-action session/ownership/no-file gates, error mapping).

#### Roles and captions — a photo now says what it SHOWS (migration `20260926120000`)
The concept design's facets, implemented as a bounded vocabulary rather than
free-text categories: **Materials** (raw components/fabrics before assembly),
**Process** (crafting/assembly in action), **Details** (textures, finishes,
hardware, stitching), **Makers** (artisans, founders, the workshop),
**In use** (the finished product worn, held, used). Each photo also takes an
optional caption (≤160 chars).

- `StoryPage.photos` is now `Json` holding `StoryPhoto[]`
  (`{ url, role?, caption? }`) instead of `String[]` of bare URLs. Migration
  converts legacy values to `{ url }` with NO role and NO caption —
  `normalizeStoryPhotos` reads that shape and the gallery renders **no badge** for
  it. Inventing a role for a photo whose subject we don't know would be a false
  claim on a consumer-facing page.
- Role and caption are both **optional by design**: a photo with no role still
  renders (badge-less), so uploading stays fast and the maker is never blocked by
  a taxonomy question. The uploader prompts for the role on every tile.
- Cover is **positional** — the first photo leads the story, and "Make cover"
  moves a photo to the front. No `isCover` flag that could fall out of sync with
  the array it describes.
- Alt text is now the MOST specific description available: the maker's caption →
  the role label → generic copy (`photoAltText`, unit-tested priority).
- Write path (`validateStoryPhotos`) is strict but **permissive in**: it accepts a
  bare URL string (a maker's tab kept open across a deploy sends the old shape)
  and upgrades it, so a deployment can't fail someone's save over a shape we can
  fix ourselves. Unknown roles and over-long captions are rejected with specific
  copy.
- Read path (`normalizeStoryPhotos`) never throws and never hides a maker's photo
  over a bad tag: an untrusted URL is dropped (logged), while a bad role or
  over-long caption keeps the photo with every field that DID validate.
- **VERIFIED LIVE** (2026-09-24, local Supabase Postgres): migration applied via
  `prisma migrate deploy`; column reads back `jsonb nullable=NO
  default='[]'::jsonb`, **0 rows are a non-array**, the one row that had photos
  survived the legacy conversion, and a structured write→read round-trip through
  the generated Prisma client + `normalizeStoryPhotos` returns the expected
  objects. Dev data was restored afterwards.
- **DEPLOY ORDER matters** (noted in the migration file): apply with the app code
  that reads objects. The previous app version expects bare strings — it would not
  render those rows correctly (it would put an object into `<img src>`), though it
  will not crash. Nothing is in production yet.

#### Preview fix — draft state is a notice, not a replacement
The studio's phone preview replaced its ENTIRE content with the coming-soon block
whenever the story was unpublished — which is every story, the whole time it is
being written. So the maker could not see the layout they were building; that is
the "preview doesn't work" report, and it was real.

The preview now always renders the draft layout (headline → cover → photo gallery
→ body) with a compact amber strip stating what shoppers currently see
(`previewDraftNotice`). `ComingSoon` remains the public page's real behavior; it
is simply no longer what the preview *becomes*.


**Follow-ups, explicitly not blockers:** orphaned R2 objects when a maker uploads
then abandons or removes a photo (no delete path yet — an R2 lifecycle rule is the
fix); `next/image` optimization for R2-hosted images (2 `no-img-element` lint
warnings today); ordering is append-only apart from "Make cover" (no
drag-to-reorder yet); the phone preview still omits the passport block that the
public page renders below the body (parity gap, deliberately left out of this
change); and JSON-LD could now carry `image` (Schema.org `Product.image`, built
from the photo URLs) — not added, because brief §6 fixes that field list.

**Owed and flagged rather than quietly skipped:** AGENTS' local migration practice
is `supabase db reset` before a push — it proves migrations apply *from scratch*,
not only incrementally. This change verified its migration by APPLYING it to the
local Supabase database instead, plus the live checks above; the from-scratch reset
is still owed before this branch merges.

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
- **Adjacent risk flagged, not changed** (HIGH-RISK zone, AGENTS rule 2):
  `app/01/[gtin]/route.ts` still spells its redirect target as the literal
  `/s/${gtin14}`. That is behaviorally identical to `storyPagePath()` today, and
  the resolver's decoupling from story-side modules is deliberate — but the same
  invariant is now described from two files, so a future change to the path
  shape must move BOTH or every scanned barcode lands on a 404. Decide when the
  resolver is next opened: either import the helper there, or add a test pinning
  the redirect target to `storyPagePath()`.

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

- **Photo upload (brief §2.1).** Done — see the Photos section above; the R2
  bucket is confirmed working end to end against the dev bucket.
- **Physical scan of the live story page (brief §8 item 3).** Real printed Phase 1
  label → resolver → published page, in production. Manual/founder step; the code
  path exists but CI cannot claim it.
- **A full studio session on real data (headline + body + photos → publish →
  scan).** The R2 half is now proven live; the manual walkthrough that a maker can
  complete the whole flow without help is still owed (same class of manual step as
  the scan).

## Out of scope (unchanged)
Compliance dashboard (Phase 3), billing (Phase 4), translated story content
(English-only per brief, content fields kept translation-ready), page-builder
customization, TipTap schema expansion, and any change to `lib/gs1/*`, the
resolver route, or `verify.ts`.
