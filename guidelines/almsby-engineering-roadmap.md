# Almsby — Engineering Roadmap & Build Sequence
*How the MVP scope and technical architecture translate into an actual build order.*

---

## 1. Guiding constraint

Nothing here is arbitrary — the sequence is driven by two things: **technical dependency** (you can't generate a barcode before you have a GTIN, can't validate compliance before you have a barcode) and **what a customer will actually pay for first** (barcode generation and story pages, per the MVP scope doc — the compliance dashboard is polish on data that already exists). Where those two pulls conflict, dependency wins — you can't build storytelling on top of a broken foundation, no matter how much customers will love it.

Also worth keeping visible: **2026 is the data-readiness year** for Sunrise 2027. That's a soft internal deadline — if Almsby isn't usable by real customers well before end of 2026, you're building a product for a wave that's already cresting.

### At a glance

| Phase | One-line goal | Est. duration* | Success metric |
|---|---|---|---|
| 0 — Foundation | Ship the scaffolding nothing else can exist without | 1-2 weeks | Signup → login → empty Product record, working end to end |
| 1 — GTIN & barcode core | Produce a barcode a real retailer scanner will accept | 3-5 weeks | 100% of test GTINs pass check-digit validation; barcode decodes correctly on 3+ physical scanner types |
| 2 — Story pages | Turn a scanned barcode into a live brand story | 2-3 weeks | Scanning a printed Phase-1 barcode loads a published story page in production |
| 3 — Compliance dashboard | Give makers an at-a-glance "am I ready" view | 1-2 weeks | A business with 10+ products can see compliance status for all of them on one screen |
| 4 — Billing & tiers | Turn the product into a business | 1-2 weeks | A real customer can subscribe, get charged, and hit their tier's product limit correctly |

*Rough estimates assuming 1-2 focused engineers; treat as ordering logic more than a committed calendar — the point is the sequence, not the exact week count.

---

## 2. Phase 0 — Foundation (before any customer-visible feature)

**Goal:** ship the scaffolding nothing else can exist without.

**Milestones:**
- [ ] Next.js 16 project set up, TypeScript, repo structure (dashboard routes, public routes, resolver route per architecture doc)
- [ ] Postgres + Prisma configured against the core schema (Business, Product, GTIN, Barcode, StoryPage, ComplianceStatus)
- [ ] Auth integrated (Clerk/Supabase Auth) — signup, login, business account creation
- [ ] Deployment pipeline to Vercel, with dev/staging/prod environments separated

**Success metric:** a developer (or you) can sign up, log in, and create an empty Business + Product record end to end, in production, not just locally.

---

## 3. Phase 1 — GTIN & barcode core (the compliance foundation)

**Goal:** produce a barcode a real retailer scanner will actually accept. This is the product's technical spine and the part with zero room for error — a barcode that fails to scan is the worst possible first impression.

**Milestones:**
- [ ] Product creation flow with core fields (name, brand, net content, country of origin, material composition)
- [ ] GTIN import with check-digit validation, unit-tested against known-good and known-bad GTINs
- [ ] GTIN concierge flow — plain-language guided content for GS1 US membership/prefix acquisition (in-app copy + links for MVP, not a live API integration)
- [ ] Digital Link URI construction using `gs1/digital-link.js`
- [ ] QR/2D barcode rendering (`qrcode` or `bwip-js`), including dual-marking output (legacy + 2D together)
- [ ] Automated decode testing in CI — round-trip test every generated barcode through a decode library (`zxing` or `jsQR`), asserting the decoded value matches the encoded Digital Link URI; run against a batch of edge-case GTINs (leading zeros, repeated digits, deliberately invalid check digits) so encoding bugs are caught on every build, not just at manual QA
- [ ] Barcode validation — automated decode check before download is allowed (same underlying check as above, applied per-barcode at generation time, not just in CI)
- [ ] Resolver endpoint (`/01/{gtin}`), domain-agnostic per the architecture doc
- [ ] Downloadable print-ready assets (PNG/SVG/PDF, sized per GS1 placement guidance)

**Success metric:** 100% of test GTINs pass check-digit validation correctly (including deliberately invalid ones being rejected), and a generated barcode decodes correctly on at least 3 different physical scanner types (a phone camera, a retail-style handheld scanner, and one other) before this phase is considered done.

**Protect this phase from scope creep.** It's tempting to jump to the dashboard or story pages since they're more visually satisfying — resist it. Nothing else in the product means anything if this doesn't work correctly.

---

## 4. Phase 2 — Story pages (the growth engine)

**Goal:** turn a scanned barcode into a live, human brand story — the piece that makes Almsby more than a compliance tool.

**Milestones:**
- [ ] Story page CMS — headline, body content, photos, sourcing/materials notes
- [ ] Public rendering at the resolver-linked URL, ISR-cached for speed
- [ ] "Powered by Almsby" badge (the referral loop from the GTM plan)
- [ ] Light-touch template/brand-color customization — no design skill required, per MVP scope
- [ ] Publish/unpublish flow

**Success metric:** scanning a real, printed barcode from Phase 1 loads a published story page in production, end to end, with no manual steps in between.

**Dependency note:** this phase can start in parallel with the tail end of Phase 1 (barcode validation/print assets) once the resolver endpoint exists — but don't start it before the resolver itself works, or you'll be building against a moving target.

---

## 5. Phase 3 — Compliance dashboard

**Goal:** give makers an at-a-glance "am I ready" view — the retention hook that turns Almsby from "a tool I used once" into "a tool I check regularly as 2027 approaches."

**Milestones:**
- [ ] `ComplianceStatus` aggregation logic (Sunrise-2027-ready / DPP-fields-complete, derived from existing Product/GTIN/Barcode data)
- [ ] Per-product status view with a plain-language checklist
- [ ] Cross-product dashboard view (matters most once a business has more than a handful of SKUs — a genuine Growth/Scale tier value driver)

**Success metric:** a business with 10+ products can see compliance status for all of them on a single screen, without opening each product individually, and the status shown matches manual verification for every product in a test set.

**Why this is last, not first, despite being a core pitch:** it's a read/aggregation layer over data Phases 1-2 already collect. Building it first means building it against fake data and rebuilding it once real fields exist; building it last means it's mostly wiring, not new logic.

---

## 6. Phase 4 — Billing & tiers

**Goal:** turn the product into a business.

**Milestones:**
- [ ] Stripe integration (or equivalent) for the tiered pricing model (Starter/Growth/Scale by product count)
- [ ] Usage enforcement (product count limits per tier, with clear upgrade prompts at the limit)
- [ ] Upgrade/downgrade flows

**Success metric:** a real customer can subscribe, get charged correctly, and be blocked (with a clear upgrade path) from exceeding their tier's product limit — verified with at least one real transaction, not just test mode.

**Timing note:** this can start as soon as Phase 1 is stable enough to demo to early customers — you don't need Phases 2-3 fully built to start charging for GTIN/barcode generation alone, if early traction supports it. Worth revisiting this sequencing once real customer conversations tell you what they'll actually pay for first.

---

## 7. What's deliberately not on this roadmap yet

Per the MVP scope doc's "explicitly not in MVP" list — these stay off the roadmap until there's a specific customer signal pulling them on:
- Full EU ESPR/DPP schema support beyond textile-relevant fields already in Phase 1
- Multi-user/team permissions
- API access for enterprise integration
- Supply chain/traceability event tracking (batch-level scan history)
- Multi-language story pages
- Custom domain resolver support (architecturally ready per Phase 1, but the actual CNAME/setup UX is its own small project — worth sequencing once a real customer asks for it)

---

## 8. Suggested review cadence

Given the Sunrise 2027 urgency, treat this roadmap as a living document, not a fixed plan:
- Re-check Phase 1 scope after the first 2-3 real customer conversations — GTIN concierge flow complexity in particular is likely to shift once you see how confused (or not) real makers actually are
- Revisit the textile DPP field requirements (Phase 1's `material_composition` fields) if the EU delegated act firms up with more specific data requirements than currently known
