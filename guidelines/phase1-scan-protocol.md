# Phase 1 — Physical multi-scanner test protocol

Executes brief §10.3. Prerequisite: barcode generation merged (#35) — labels
print from `/products/{id}/label`. **Do not trust any symbol until the
`NEXT_PUBLIC_RESOLVER_URL` gate (§10.6) is cleared.** ✅ Cleared 2026-08-30:
labels now encode the real per-env resolver domain
(`id.staging.almsby.com` on staging / `id.almsby.com` on prod). Labels printed
**before** that date encode a placeholder URI — regenerate them.

⚠️ **Staging is behind Vercel SSO Deployment Protection**: `id.staging.almsby.com`
302s to a vercel.com login for non-authenticated requests, so a physical scanner
resolving a staging-encoded URI hits a login wall, not the story. Before running
this test against staging labels, either disable Vercel Authentication for the
project (Vercel → Settings → Deployment Protection) or run the test against
prod-encoded labels instead.

## Label preparation

1. Pick 2–3 products with valid imported GTINs (one per GTIN length if
   possible: GTIN-8, GTIN-12/13 normalized).
2. Open the label print route, print on **real label stock at real size** —
   no screen screenshots. Confirm: X-dimension ≥ 0.35 mm, quiet zones intact
   (≥4 modules QR / 2–3× DataMatrix), dual marks both present, "GS1" caption
   under the DataMatrix.
3. Print at least 2 copies of each label (print-quality variance is part of
   the test).

## Scanner matrix (3+ required per brief §10.3)

| # | Device class | Example | Notes |
|---|---|---|---|
| 1 | Phone camera | any modern iOS/Android camera app | tests consumer scan path |
| 2 | Retail-style handheld | 2D imager (e.g. Zebra DS2208-class) | the retail acceptance case |
| 3 | Other | laptop webcam + decoder, tablet, or kiosk scanner | third device class |

## Pass criteria (per device × per symbol)

- **DataMatrix**: decodes to AI(01) + the exact 14-digit GTIN.
- **QR**: decodes to the Digital Link URI (`<resolver>/01/<gtin14>`) and, when
  tapped/browsed, resolves to the story route on staging.
- First-scan success within ~2 s at natural handheld distance (~10–30 cm).
- Repeat 3× per device per symbol — all attempts must pass (flaky = fail).

## Results log

Record per row: device, symbol, label, attempt 1/2/3 outcome, scan distance,
lighting. Attach to this file (or link a sheet). A single failure fails the
gate: investigate size/quiet-zone/darkness before re-running.

## After the test

- Log outcomes in `phase1-dod-status.md` §10.3.
- Any failure → file the symptom (which device, which symbol, print size)
  against the barcode-generation epic before re-printing.
