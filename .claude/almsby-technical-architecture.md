# Almsby — Technical Architecture & Data Model
*Companion to the MVP scope doc — this is what to actually build against.*

---

## 1. Recommended stack

**Framework: Next.js (App Router), full-stack, single repo for the MVP.**

You already lean Next.js/React, and it's the right call here for a specific reason beyond preference: Almsby has three surfaces that all need to share the same data — the maker's dashboard (auth'd app), the public story pages (fast, SEO-friendly, no auth), and the barcode-resolution endpoint that a GS1 Digital Link URI actually points to. Next.js lets all three live in one deployable app (dashboard as authenticated routes, story pages as public dynamic routes, barcode resolution as an API/edge route) without standing up separate services this early.

| Layer | Recommendation | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Single app for dashboard + public story pages + resolver endpoint |
| Language | TypeScript | GTIN/barcode data has real structure — types catch a lot here |
| Database | PostgreSQL via Supabase | Bundled with auth for operational simplicity while dashboard traffic is modest and predictable — cost is roughly a wash against Neon at this stage, so the deciding factor is fewer services to manage, not price |
| Auth | Supabase Auth | Same rationale — one less vendor while user volume is low; revisit only if a specific Supabase Auth limitation surfaces |
| File/image storage | Cloudflare R2 (not Supabase Storage) | R2 charges zero egress fees at any volume, while Supabase Storage bills bandwidth like standard S3-style egress pricing. This matters specifically for Almsby because the growth model depends on story pages getting scanned and viewed a lot — every product photo served to a consumer is egress traffic. Under Supabase Storage, a successful referral loop literally increases your bill; under R2, that same growth costs nothing extra. Splitting storage out to R2 while keeping Supabase for DB/Auth isn't materially more operational overhead (Supabase Storage was optional either way), and it removes the one place cost could scale the wrong direction with success |
| Barcode/QR generation | `gs1/digital-link.js` (GS1's own SDK) to construct compliant URIs, + `qrcode` npm package (or `bwip-js` for more symbology control) to render | Don't hand-roll GS1 Digital Link URI construction — use GS1's official library so AI (Application Identifier) syntax is correct, then render separately |
| Hosting | Vercel | Native Next.js fit, handles the public story-page traffic pattern well (mostly static/ISR) |
| Background jobs | Inngest or a simple queue (later) | Not needed for MVP — barcode generation is fast enough to do synchronously at first |

**What NOT to build yet:** a separate backend service, a mobile app, multi-region infrastructure, or a custom auth system. All of these are premature before you have paying customers.

---

## 2. System architecture (how the pieces fit)

```
                        ┌─────────────────────────┐
                        │   Maker Dashboard        │
                        │   (authenticated,        │
                        │   Next.js App Router)    │
                        │   /app/dashboard/*        │
                        └───────────┬───────────────┘
                                    │ writes
                                    ▼
                        ┌─────────────────────────┐
                        │   PostgreSQL (Prisma)    │
                        │   products, gtins,       │
                        │   barcodes, story_pages, │
                        │   compliance_status      │
                        └───────────┬───────────────┘
                        reads       │        reads
              ┌─────────────────────┼─────────────────────┐
              ▼                                            ▼
┌───────────────────────────┐                ┌───────────────────────────┐
│  Public Story Page          │                │  GS1 Digital Link          │
│  Almsby.io/s/{gtin}      │                │  Resolver Endpoint         │
│  (public, ISR-cached)       │                │  /01/{gtin} etc.           │
│  — the human-facing side    │                │  — what the QR code        │
│                              │                │    actually encodes,       │
│                              │                │    routes by context       │
│                              │                │    (consumer vs retailer)  │
└───────────────────────────┘                └───────────────────────────┘
```

**The key architectural decision:** the QR code on a product does not encode the story page URL directly. It encodes a **GS1 Digital Link URI** (e.g. `https://Almsby.io/01/{gtin}`), and that resolver endpoint is what decides where to send the scanner based on context — a consumer's phone gets redirected to the story page, while a system identifying itself as a retail/logistics client could get routed to structured compliance data instead. This is what makes "one barcode, two audiences" actually work technically, not just as a slogan — and it's exactly the pattern GS1's own resolver architecture is built around.

---

## 3. Core data model

```
Business
├── id
├── name
├── gs1_prefix              (nullable — set once they have one)
├── gs1_membership_status   (none | in_progress | active)
├── subscription_tier       (starter | growth | scale)
└── created_at

Product
├── id
├── business_id             (FK → Business)
├── name
├── brand
├── net_content
├── country_of_origin
├── material_composition     (structured — DPP-relevant, textiles especially)
├── sourcing_notes
├── status                   (draft | active | archived)
└── created_at

GTIN
├── id
├── product_id               (FK → Product, 1:1)
├── gtin_value                (14-digit, validated with check-digit logic)
├── source                    (own_prefix | Almsby_assisted)  — tracks concierge-model onboarding
└── created_at

Barcode
├── id
├── gtin_id                   (FK → GTIN)
├── digital_link_uri          (constructed via gs1/digital-link.js)
├── format                    (qr | gs1_datamatrix)
├── legacy_barcode_value       (EAN/UPC, for dual-marking)
├── validated                  (boolean — passed print-quality/decode check)
├── asset_url                  (generated PNG/SVG in storage)
└── created_at

StoryPage
├── id
├── product_id                (FK → Product, 1:1)
├── headline
├── body_content               (rich text / structured blocks)
├── photos                     (array of storage URLs)
├── published                  (boolean)
└── updated_at

ComplianceStatus
├── id
├── product_id                 (FK → Product, 1:1)
├── sunrise_2027_ready          (boolean, derived from GTIN + Barcode completeness)
├── dpp_fields_complete          (boolean, derived from material_composition etc. being filled)
├── last_checked_at
```

**Why `ComplianceStatus` is its own table rather than computed on the fly:** the dashboard's whole retention hook is a fast "what's not done yet" view across potentially hundreds of products. Precomputing (and updating on relevant writes) keeps that view cheap, and gives you a natural place to hang future rules as GS1/DPP requirements get more specific.

---

## 4. Build sequence (maps to the MVP doc's feature groups)

1. **Data model + auth + Business/Product CRUD** — the unglamorous foundation, but everything else depends on it
2. **GTIN handling** — both import (validate existing GTIN check digits) and the concierge flow (guided GS1 US membership walkthrough, even if it's just excellent in-app copy at first, not an API integration)
3. **Barcode generation** — construct the GS1 Digital Link URI, render the QR/2D barcode, validate it decodes correctly, generate downloadable print assets
4. **Resolver endpoint** — the `/01/{gtin}` route that actually gets scanned; this is a small but critical piece, since it's the thing physically printed on packaging and effectively permanent once printed
5. **Story page CMS + public rendering**
6. **Compliance dashboard** — mostly a read/aggregation layer once the above exist

---

## 5. Open technical questions to resolve early

- **Digital Link domain ownership — decided:** support both from day one. Default every product to `Almsby.io/01/{gtin}` for zero-setup onboarding, but build the resolver to be domain-agnostic (look up by GTIN regardless of incoming host) so a custom domain via CNAME is just a routing config, not a rebuild. Position custom domain as a Scale-tier/add-on feature — it's a natural "you've made it" upsell, and building it in now avoids ever having to ask a customer to reprint barcodes already in the field.
- **GTIN check-digit and format validation:** build this carefully and test it thoroughly; a barcode that fails to scan at a real retailer is the single worst first impression Almsby could make.
- **Compressed Digital Link URIs:** GS1's tooling supports a compression scheme for shorter, less-dense QR codes — worth evaluating once you see real-world scan reliability at small print sizes, not necessarily for v1.
