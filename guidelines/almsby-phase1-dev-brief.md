# Almsby — Phase 1 Developer Brief
*GTIN & barcode core — the product's technical spine. Zero room for error here.*

---

## 1. Context (read this first)

Phase 0 built the foundation — auth, database, deployment. Phase 1 builds the thing Almsby actually is: a system that takes a maker's product and produces a barcode a real retailer's scanner will accept, encoding a GS1 Digital Link URI that also resolves to a human story.

**This phase has the least room for error of anything in the roadmap.** A barcode that fails to scan at a real retailer is the single worst first impression Almsby can make — worse than a slow dashboard, worse than a missing feature. Everything else in this brief is in service of that one non-negotiable outcome: a correct, scannable, dual-marked barcode.

Full technical grounding lives in the architecture doc and the engineering roadmap (Phase 1 section) — this brief is the actionable spec for actually building it.

---

## 2. What ships in this phase

1. Product creation flow (core fields)
2. GTIN import + validation
3. GTIN concierge flow (guided GS1 membership content)
4. Digital Link URI construction
5. 2D barcode rendering, dual-marked with legacy barcode
6. Automated decode testing (CI + per-generation)
7. Resolver endpoint (`/01/{gtin}`)
8. Downloadable print-ready assets

**Explicitly not in this phase:** story page content/CMS (Phase 2), compliance dashboard aggregation (Phase 3), billing (Phase 4). The resolver endpoint gets built now but only needs to route correctly — it doesn't need to render a real story page yet. A placeholder response is fine.

---

## 3. Product creation flow

Core fields, per the MVP scope doc:

```
name              (required)
brand             (optional, defaults to Business name)
netContent        (optional)
countryOfOrigin   (optional for MVP, required before Sunrise-2027-ready status)
materialComposition (structured — see schema below, textile-relevant for DPP readiness)
status            (draft | active | archived)
```

Build this as a straightforward form. No special handling needed — this is the least risky part of the phase. Don't over-invest here; the GTIN and barcode work below is where the real effort belongs.

---

## 4. GTIN import and validation

**This is the first place correctness actually matters.** A GTIN is a 14-digit number (GTIN-14) with a check digit calculated via a standard modulo-10 algorithm. Get this wrong and everything downstream is wrong.

**Required behavior:**
- Accept GTIN-8, GTIN-12 (UPC), GTIN-13 (EAN), or GTIN-14 input, normalize to GTIN-14 internally (left-pad with zeros)
- Validate the check digit using the standard GS1 algorithm — reject anything that fails
- Unit test against known-good GTINs (real published examples) and deliberately broken ones (wrong check digit, wrong length, non-numeric characters, all-zero, all-same-digit)

**GTIN source tracking:** every GTIN record should record whether it came from the maker's own existing prefix (`source: own_prefix`) or was set up through Almsby's guided flow (`source: almsby_assisted`) — this matters for both support purposes and understanding onboarding friction later.

```typescript
// Required test cases — do not ship without these passing
const validGtins = ['00012345678905', '04006381333931']; // real check-digit-valid examples
const invalidGtins = [
  '00012345678906', // wrong check digit
  '123',            // too short
  'abcd1234567890', // non-numeric
  '00000000000000', // all zero — edge case, decide if this should be rejected outright
];
```

---

## 5. GTIN concierge flow

Plain-language guided content for makers who don't have a GS1 prefix yet. **This is content and UX work, not an API integration** — do not build a live connection to GS1's membership systems for Phase 1.

**Required flow:**
1. Detect a new product with no GTIN → offer "I already have a GTIN" vs. "I need one"
2. If "I need one" → plain-language explanation of what a GS1 prefix is, why it's needed, and a direct link to GS1 US membership registration
3. Once the maker has a prefix (self-reported for now), let them generate GTINs under it using standard GS1 sequential numbering rules

**Tone matters here specifically** — this is the exact moment referenced throughout the MVP scope and GTM docs as the place Almsby earns trust by translating GS1 jargon into something a first-time maker can actually follow. Don't just link to GS1's own documentation and call it done; write the plain-language explanation yourself.

---

## 6. Digital Link URI construction

Use GS1's own `gs1/digital-link.js` library — do not hand-roll AI (Application Identifier) syntax construction. This library ensures the URI structure is spec-compliant.

```typescript
import { DigitalLinkURI } from 'gs1-digital-link-toolkit'; // or equivalent per current GS1 SDK

const uri = new DigitalLinkURI()
  .setDomain(process.env.NEXT_PUBLIC_RESOLVER_URL)
  .setGTIN(product.gtin.value)
  .build();
// → https://[resolver-domain]/01/00012345678905
```

**Critical:** this must read `NEXT_PUBLIC_RESOLVER_URL`, never `NEXT_PUBLIC_APP_URL`, never a hardcoded domain. This discipline was established in the Phase 0 brief specifically so this exact piece of code can't get it wrong. If the resolver domain still isn't finalized when this gets built, confirm what placeholder value `NEXT_PUBLIC_RESOLVER_URL` currently holds before writing a single generated barcode to the database — anything generated against a placeholder should be clearly flagged as non-final in the UI.

---

## 7. Barcode rendering

**Library choice:** `bwip-js` is recommended over the plain `qrcode` package — it supports GS1-specific symbologies (GS1 DataMatrix, GS1-128) in addition to QR, which matters since dual-marking requires rendering both the new 2D code and a legacy linear barcode together.

**Required output:**
- The 2D code (QR or GS1 DataMatrix, per GS1 Digital Link spec) encoding the constructed URI
- The legacy barcode (EAN/UPC, derived from the same GTIN) rendered alongside it
- Both rendered at GS1-spec minimum size and quiet-zone margins — don't let a UI convenience default override these
- Output formats: PNG (screen preview), SVG (scalable, for design tools), PDF (print-ready, sized for common label formats)

**Do not let barcode size be a free-form UI control without a floor.** If the interface allows resizing for design purposes, enforce a hard minimum in code that matches GS1's minimum X-dimension spec — a maker being able to accidentally generate an unscannable barcode because they made it too small is exactly the failure mode this whole phase exists to prevent.

---

## 8. Automated decode testing

Two distinct checks, both required, per the roadmap:

**CI round-trip test (runs on every build):**
```typescript
// Pseudocode — actual implementation depends on chosen decode library
import { decode } from 'zxing-wasm'; // or jsQR for pure QR

test('generated barcode decodes to the correct Digital Link URI', async () => {
  const gtin = '00012345678905';
  const generatedBarcode = await generateBarcode(gtin);
  const decoded = await decode(generatedBarcode.imageBuffer);
  expect(decoded).toBe(constructDigitalLinkURI(gtin));
});
```
Run this against the same edge-case GTIN batch used in section 4's validation tests (leading zeros, repeated digits) — encoding bugs often only show up on specific digit patterns.

**Per-generation validation (runs every time a user generates a barcode):**
Same underlying decode check, but applied live before the download button is enabled. If a barcode fails to decode correctly at generation time, block the download and surface an error — never let a maker download a barcode that hasn't passed this check.

---

## 9. Resolver endpoint

`/01/[gtin]/route.ts` — per the repo structure established in Phase 0, kept structurally separate from `/api`.

**Phase 1 scope:** the endpoint needs to correctly parse the GTIN from the path, look it up in the database, and respond — but the response can be minimal for now (a placeholder page or a redirect to a "coming soon" story page). The real story page content is Phase 2's job.

**What must work correctly in Phase 1, even with placeholder content:**
- Correct GTIN parsing from the URL path
- Domain-agnostic lookup (per the architecture doc's decision to support both the primary resolver domain and future custom domains) — don't hardcode the domain in the lookup logic
- Graceful handling of an unknown/invalid GTIN (404, not a crash)
- Response time — this endpoint will eventually be hit by real scans in retail environments; keep it fast even with placeholder content

---

## 10. Definition of done for Phase 1

- [ ] 100% of test GTINs (valid and invalid) pass or fail validation correctly, per the test cases in section 4
- [ ] A generated barcode decodes correctly via the automated CI test, across the full edge-case GTIN batch
- [ ] A physically printed barcode (real printer, real label stock, real size) decodes correctly on at least 3 different scanner types: a phone camera, a retail-style handheld scanner, and one other
- [ ] The resolver endpoint correctly routes a real GTIN to a response and a 404 for an unknown one, in the deployed staging environment
- [ ] GTIN concierge flow copy has been read by someone with zero GS1 knowledge and confirmed understandable
- [ ] `NEXT_PUBLIC_RESOLVER_URL` is confirmed correct (or intentionally flagged as placeholder) before any barcode generated during this phase is treated as real

---

## 11. Explicit guardrails — what NOT to build in Phase 1

- No story page CMS or content — placeholder response only at the resolver endpoint
- No compliance dashboard or aggregation logic
- No billing/Stripe integration
- No live API integration with GS1's membership systems — concierge flow is guided content only
- No custom domain resolver support beyond what Phase 0 already made domain-agnostic — don't build the actual CNAME/setup UX yet

If a developer finds themselves building any of the above "while they're in there," that's the signal to stop and check in — same discipline as Phase 0.
