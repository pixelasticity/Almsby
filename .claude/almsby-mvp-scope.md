# Almsby — MVP Product Scope

*Every product has a story. Almsby makes GS1 compliance and Digital Product Passports simple enough for the people who don't have a compliance department.*

---

## 1. Who the MVP is for

**Beachhead customer:** a small clothing/apparel or textile maker — 1 to ~20 employees — selling through independent boutiques, wholesale, and a growing D2C/e-commerce channel, who:
- Doesn't have GTINs assigned, or has them assigned inconsistently
- Has never touched GS1 Digital Link or 2D barcodes
- Is starting to hear "Sunrise 2027" from a wholesale buyer or retailer and doesn't know what it means for them
- Is facing (or will soon face) a real EU Digital Product Passport requirement if they sell into or ship to Europe, since textiles is one of the earliest confirmed DPP product categories
- Wants to tell customers about materials, sourcing, and craftsmanship, but has no easy way to do it

This customer is often more design/brand-conscious and more comfortable with e-commerce tooling (Shopify, etc.) than a traditional retail-logistics customer — onboarding and messaging should assume digital fluency, even if GS1/barcode concepts are new to them.

**Explicitly out of scope for MVP:** large CPG/apparel brands, multi-brand enterprises with existing PIM/ERP systems, full complex DPP data schemas for categories with later or unconfirmed timelines (furniture, electronics, iron/steel). Those are Phase 2+ — furniture in particular is a natural next vertical once Almsby is proven, since it shares the same "small maker, real DPP exposure" profile just on a later timeline.

---

## 2. The core job to be done

> "Give me one barcode that satisfies my retailer, tells my customer my story, and doesn't require me to understand what GS1 Digital Link even means."

Everything in the MVP should serve that sentence.

---

## 3. MVP feature set

### A. Product & GTIN setup (the compliance foundation)
- Guided onboarding: add a product with plain-language prompts (no GS1 jargon up front)
- GTIN assignment or import — support both "I already have a GS1 prefix" and "I need help getting one" (explain GS1 US/GS1 org membership requirement, don't try to bypass it)
- Basic product data fields required for Sunrise 2027 dual-marking: product name, GTIN, brand, net content, batch/lot (optional at MVP), country of origin

### B. 2D barcode generation (the compliance deliverable)
- Generate a GS1 Digital Link–compliant QR code per product
- Dual-marking support: output both the legacy barcode (if they have one) and the new 2D code together, sized/formatted per GS1 placement guidance
- Downloadable, print-ready barcode files (PNG/SVG/PDF) sized for common label formats
- Barcode validation check (does it decode correctly, does it meet ISO print-quality basics) before they send it to a printer

### C. The story page (the human, consumer-facing layer)
- Each GTIN gets a hosted, mobile-friendly page the QR code resolves to
- Simple CMS: origin story, photos, materials/sourcing info, sustainability notes, the maker's own words
- This is the wedge — the retailer's scanner reads the compliance data, the consumer's phone reads the story, same code, per GS1 Digital Link's multi-audience design
- No design skill required — templated, brand-color customization only

### D. Compliance status dashboard
- Per-product view: "Sunrise 2027 ready" / "needs attention" status
- Plain-language checklist of what's done and what's missing
- This becomes the retention hook — they check back as the 2027 deadline approaches

### Explicitly NOT in MVP
- Full EU ESPR/DPP schema support (battery/textile-specific data models)
- Multi-user/team permissions
- API access for enterprise integration
- Supply chain/traceability event tracking (batch-level scan history) — this is a strong Phase 2 feature but adds real complexity
- Multi-language story pages (Phase 2, but flag early since it may matter more than expected for import/export sellers)

---

## 4. Success criteria for the MVP

You'll know the MVP is working if a first-time user, with no GS1 knowledge, can go from "I have a product" to "I have a print-ready, Sunrise-2027-compliant 2D barcode with a live story page" in one sitting — call it under 20 minutes — without needing to talk to a human.

---

## 5. Decisions made, and what's still open

**Resolved:**
- **GS1 prefix dependency:** Almsby takes the concierge approach — doesn't issue GTINs itself, but guides users through GS1 US membership/prefix acquisition in plain language as part of onboarding. Pursuing GS1 US Solution Partner status is worth prioritizing early for the credibility it lends with a first-time buyer.
- **Pricing model:** Tiered by product count (e.g., up to 12 / 120 / 1,200 SKUs), covering GTIN management, barcode generation, and compliance tracking. Story pages are free on every tier, with a "Powered by Almsby" badge acting as a referral loop. Compliance is the paid layer because it's the thing with real, near-term consequences attached (delisting risk) — the story page drives growth, not revenue, at this stage.

**Still open:**
- **Hosting/domain for story pages:** subdomain per business (Almsby.io/yourbrand) vs. custom domain support — affects brand trust for the small business.
- **Exact price points per tier:** the tier structure is set, but actual dollar amounts need testing against real conversations with target customers before locking in.
- **Data portability:** if a maker outgrows Almsby and needs enterprise PIM later, can they export their GTIN/product data cleanly? Worth designing for from day one — it's a trust signal, not just a technical nicety.

---

## 6. Suggested build order

1. GTIN setup + basic product data (A)
2. 2D barcode generation + validation (B)
3. Story page CMS (C)
4. Compliance dashboard (D)

Barcode generation and story pages are the two things a customer will actually pay for — get those working end-to-end before investing heavily in the dashboard polish.
