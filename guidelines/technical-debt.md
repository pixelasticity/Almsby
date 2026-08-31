# Technical Debt & Deferred Optimizations

Living log for code-level items noted during review but deliberately **not
tackled yet**. Each entry records what, where, why deferred, and what would
unblock it. Nothing here is scheduled — this is a memory, not a promise.
Last updated: 2026-08-31.

---

## 1. Label page computes the barcode symbol set twice (dedup: logic-only)

- **Where:** `lib/hooks/useBarcodeRenders.ts` — consumed by
  `components/label/DualMarkLabel.tsx` (display) + `components/label/LabelDownloads.tsx`
  (downloads) on `app/(dashboard)/products/[id]/label/page.tsx`.
- **What:** the page mounts both label components, each its own React
  instance, so the same three bwip-js SVGs (QR, GS1 DataMatrix, EAN-13) are
  computed twice per page load (6 renders). Extracting `useBarcodeRenders`
  deduped the render **memo** (single source of truth, commit `dd461f0`) but
  cannot reduce the **execution count** across separate component instances.
- **Why deferred:** the low-risk dedup won on cost/benefit; a true fix
  (halving to 3 renders) requires lifting the renders into a shared client
  parent that passes results to both children — a page-level restructure of
  component APIs. Revisit only if label-page CPU ever shows up in profiling;
  the page already does ~1s of server-side decode verification, which dominates.
- **Gate when tackled:** the shared parent must still call `verifyBarcode`
  exactly once per label-page render set. `lib/gs1/verify.ts` is the
  compliance correctness gate — do not move, gate, deduplicate, or double it.