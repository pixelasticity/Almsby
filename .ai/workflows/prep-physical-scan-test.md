# Workflow: prepping for the physical multi-scanner test

Source of truth: `guidelines/quality/protocols/physical-scan.md`. **The test
itself is a physical, human task — an agent cannot perform it.** This
workflow covers only the parts an agent can legitimately help with
beforehand.

Note: that file currently bundles the generic, reusable protocol together
with the phase-1-specific operational instance (label prep, scanner matrix,
results log) in a single document. If it's since been split into a generic
protocol plus a separate evidence/instance file, follow whichever file
actually contains the label-prep and scanner-matrix steps referenced below.

## What an agent CAN do

1. Confirm the resolver gate is cleared: check that `NEXT_PUBLIC_RESOLVER_URL`
   is set to a real per-environment domain, not a placeholder — read
   `lib/env.ts`'s `isPlaceholderResolverUrl` logic, do not reimplement it.
   If unsure whether the currently configured value is real, say so; don't
   guess.
2. Confirm decode verification is green for the specific GTIN(s) about to be
   printed — run the relevant suite (`tests/gs1/barcode-decode.test.ts`,
   `tests/gs1/legacy-barcode.test.ts`) and report pass/fail, not "should be
   fine."
3. Generate the exact-size print page URL(s) for the products being tested
   (`/products/{id}/label/print`) so a human can open and print them —
   an agent should never claim to have "printed" anything.
4. Draft the results-log entry template (device × symbol × attempt) per the
   protocol's "Results log" section, ready for a human to fill in.
5. If staging labels are being tested, surface the Vercel SSO Deployment
   Protection caveat from the protocol doc *before* the human starts — this
   is a documented gotcha, not something to let them discover mid-test.

## What an agent must NOT do

- Claim a symbol "will scan fine" based on the SVG/decode-test output alone.
  Structural correctness and decode-round-trip correctness are necessary but
  explicitly **not sufficient** per the protocol doc — only the physical test
  proves it.
- Mark `guidelines/delivery/phase1/dod-status.md` item §10.3 (or any DoD item
  gated on a manual/physical step) as done based on code changes alone.
  Code-done and phase-done are different claims (`AGENTS.md`, "What NOT to do
  without asking").
