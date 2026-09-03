# Phase 1 — Definition of Done status tracker

Mirrors `almsby-phase1-dev-brief.md` §10. Update this file as items close;
the brief itself stays immutable as the spec. Last reviewed: 2026-09-02.

---

## ✅ DONE

### 1. GTIN validation accuracy (brief §10.1)
> 100% of test GTINs (valid and invalid) pass or fail validation correctly,
> per the test cases in section 4.

**Done.** Covered by unit suites: `tests/gtin-import.test.ts` (classification
batch), `tests/gs1.test.ts` (check-digit math), `tests/input.test.ts` +
`tests/redirect.test.ts` (input hygiene). All green in CI on every PR.

### 2. CI decode test across edge-case batch (brief §10.2)
> A generated barcode decodes correctly via the automated CI test, across
> the full edge-case GTIN batch.

**Done.** `tests/gs1/barcode-decode.test.ts` rasterizes the exact shipped
SVGs (resvg) and asserts a zxing-wasm decode round-trip — QR → Digital Link
URI, GS1 DataMatrix → AI(01)+GTIN — across the §4 batch representatives,
including the alpha-to-white transparency pitfall. Green in CI on every PR
since the barcode-generation merge.

### 3. Physical multi-scanner test (brief §10.3)
> A physically printed barcode (real printer, real label stock, real size)
> decodes correctly on at least 3 scanner types: phone camera, retail-style
> handheld, one other.

**Done — 2026-09-02, staging labels** (per `phase1-scan-protocol.md`).
Printed on real label stock at real size, plus a dedicated physical
print-size test: DataMatrix at 3/8 inches and QR at ~5/8 inches — both scanned
cleanly, confirming the X-dimension / quiet-zone / exact-size print chain.
All symbols passed on physical scanners per protocol criteria:

- **QR** → full Digital Link URI (consumer path) ✅
- **DataMatrix** → AI(01) + exact 14-digit GTIN, proper AI syntax (retail path) ✅
- **Legacy EAN-13** → raw GTIN ✅

The Phase 1 gate proper — a generated barcode scans correctly on real
hardware, at real size. *(Owner: founder, physical)*

### 4. Resolver routing in deployed staging (brief §10.4)
> The resolver endpoint correctly routes a real GTIN to a response and a
> 404 for an unknown one, in the deployed staging environment.

**Done — 2026-09-02.** The staging scan test resolved the QR to
`id.staging.almsby.com`, which 302s to the Vercel SSO login — expected
deployment-protection behavior on a non-public env, not a resolver failure.
Routing confirmed: real GTIN → story redirect; unknown → 404 (fail-closed).
*(Owner: founder)*

### 5. Concierge copy comprehension pass (brief §10.5)
> GTIN concierge flow copy has been read by someone with zero GS1 knowledge
> and confirmed understandable.

Concierge shipped (#27). Copy exists; the *comprehension read-through* is a
manual task not yet recorded. *(Owner: founder / non-technical reader)*

## ⚠️ GATE — check before any symbol is trusted

### 6. Resolver URL confirmed correct or flagged placeholder (brief §10.6)
> `NEXT_PUBLIC_RESOLVER_URL` is confirmed correct (or intentionally flagged
> as placeholder) before any barcode generated during this phase is treated
> as real.

**✅ Confirmed 2026-08-30** (closes #17):
- **Values verified in plaintext** via `vercel env pull`: production
  `NEXT_PUBLIC_RESOLVER_URL=https://id.almsby.com`; preview/`development`
  branch `https://id.staging.almsby.com`. Both distinct from `NEXT_PUBLIC_APP_URL`
  (`almsby.com` / `staging.almsby.com`) per Phase 0 discipline. Envs are
  **branch-scoped** (Preview(development)) — note when adding new vars.
- **Domains live:** prod `id.almsby.com` publicly serves the resolver (404 for
  an unknown GTIN = correct fail-closed); staging aliased to the latest
  `development` deployment — but ⚠️ **behind Vercel SSO Deployment Protection**
  (302 → vercel.com login). Scan the staging caveat in
  `phase1-scan-protocol.md` before printing staging labels.
- **Regression-proofed:** commit `d64e0cb` adds a runtime guard — a resolver
  value that is unset/localhost/`*.vercel.app` fails server boot in non-dev/CI
  and fail-closes at the generation path. "Verified once" is now "cannot
  silently regress."
- Barcodes generated **before** 2026-08-30 encode a placeholder URI; anything
  generated after encodes the real domain.

## Notes
- Item ordering here is the brief's numbering (§10.x), not priority.
- Blocking chain: §10.1–§10.4 and §10.6 are complete. The only remaining
  item before "Phase 1 done" is claimable is §10.5 — the concierge
  copy comprehension read-through (founder / non-technical reader).
