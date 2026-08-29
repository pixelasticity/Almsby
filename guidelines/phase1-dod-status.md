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

## 🔓 UNBLOCKED — barcode generation merged (#35), execution pending

### 2. CI decode test across edge-case batch (brief §10.2)
> A generated barcode decodes correctly via the automated CI test, across
> the full edge-case GTIN batch.

**Code complete** in `test/barcode-decode`: `tests/gs1/barcode-decode.test.ts`
rasterizes the exact shipped SVGs (resvg) and asserts a zxing-wasm decode
round-trip — QR → Digital Link URI, GS1 DataMatrix → AI(01)+GTIN — across the
§4 batch representatives. Covers the transparency pitfall (alpha flattened to
white before decode). Closes on merge.

### 3. Physical multi-scanner test (brief §10.3)
> A physically printed barcode (real printer, real label stock, real size)
> decodes correctly on at least 3 scanner types: phone camera, retail-style
> handheld, one other.

**Unblocked.** Protocol drafted: `phase1-scan-protocol.md` (label prep,
device matrix, pass criteria, results log). Print labels from
`/products/{id}/label` and execute. This is the Phase 1 gate proper.
*(Owner: founder, physical)*

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
