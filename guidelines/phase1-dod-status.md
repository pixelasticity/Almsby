# Phase 1 — Definition of Done status tracker

Mirrors `almsby-phase1-dev-brief.md` §10. Update this file as items close;
the brief itself stays immutable as the spec. Last reviewed: 2026-08-26.

---

## ✅ DONE

### 1. GTIN validation accuracy (brief §10.1)
> 100% of test GTINs (valid and invalid) pass or fail validation correctly,
> per the test cases in section 4.

**Done.** Covered by unit suites: `tests/gtin-import.test.ts` (classification
batch), `tests/gs1.test.ts` (check-digit math), `tests/input.test.ts` +
`tests/redirect.test.ts` (input hygiene). All green in CI on every PR.

### 4. Resolver routing in deployed staging (brief §10.4)
> The resolver endpoint correctly routes a real GTIN to a response and a
> 404 for an unknown one, in the deployed staging environment.

**Code complete, merged** (`/01/[gtin]` DB-backed resolver: found → story
redirect, unknown → 404, DB-down → 503). **Staging confirmation pending**
— needs the founder's Vercel/Supabase staging env live; final tick happens
there with a seeded product. *(Owner: founder)*

### 5. Concierge copy comprehension pass (brief §10.5)
> GTIN concierge flow copy has been read by someone with zero GS1 knowledge
> and confirmed understandable.

Concierge shipped (#27). Copy exists; the *comprehension read-through* is a
manual task not yet recorded. *(Owner: founder / non-technical reader)*

## 🔲 BLOCKED — waiting on barcode generation (Sr. Dev, in progress)

### 2. CI decode test across edge-case batch (brief §10.2)
> A generated barcode decodes correctly via the automated CI test, across
> the full edge-case GTIN batch.

**Blocked:** no barcode rendering exists yet. Suggested approach forwarded:
bwip-js render → rasterize → zxing-wasm decode, asserting payload == Digital
Link URI for every GTIN in the §4 batch. Lands as part of the generation PR.

### 3. Physical multi-scanner test (brief §10.3)
> A physically printed barcode (real printer, real label stock, real size)
> decodes correctly on at least 3 scanner types: phone camera, retail-style
> handheld, one other.

**Blocked by #2**, then needs: printed labels from the real generator + a
scan protocol doc (device classes, X-dimension ≥0.35mm, quiet zones,
pass/fail, results log). Protocol will be drafted as soon as generation
merges. This is the Phase 1 gate proper. *(Owner: founder, physical)*

## ⚠️ GATE — check before any symbol is trusted

### 6. Resolver URL confirmed correct or flagged placeholder (brief §10.6)
> `NEXT_PUBLIC_RESOLVER_URL` is confirmed correct (or intentionally flagged
> as placeholder) before any barcode generated during this phase is treated
> as real.

Resolver discipline is enforced structurally (CI grep + single construction
point). But the *value* configured per environment has NOT been audited this
cycle — with domains still undecided (per founder checklist item 6), treat
every barcode generated so far as encoding a placeholder URI.
*(Owner: founder, before trusting any print)*

## Notes
- Item ordering here is the brief's numbering (§10.x), not priority.
- Blocking chain: generate (2) → print protocol (3) → physical test passes
  → then "Phase 1 done" is claimable alongside items 1/4/5/6 ticks.
