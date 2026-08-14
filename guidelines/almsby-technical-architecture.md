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
│  almsby.com/s/{gtin}      │                │  Resolver Endpoint         │
│  (public, ISR-cached)       │                │  /01/{gtin} etc.           │
│  — the human-facing side    │                │  — what the QR code        │
│                              │                │    actually encodes,       │
│                              │                │    routes by context       │
│                              │                │    (consumer vs retailer)  │
└───────────────────────────┘                └───────────────────────────┘
```

**The key architectural decision:** the QR code on a product does not encode the story page URL directly. It encodes a **GS1 Digital Link URI** (e.g. `https://almsby.com/01/{gtin}`), and that resolver endpoint is what decides where to send the scanner based on context — a consumer's phone gets redirected to the story page, while a system identifying itself as a retail/logistics client could get routed to structured compliance data instead. This is what makes "one barcode, two audiences" actually work technically, not just as a slogan — and it's exactly the pattern GS1's own resolver architecture is built around.

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
├── source                    (own_prefix | almsby_assisted)  — tracks concierge-model onboarding
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

- **Digital Link domain ownership — decided:** support both from day one. Default every product to `almsby.com/01/{gtin}` for zero-setup onboarding, but build the resolver to be domain-agnostic (look up by GTIN regardless of incoming host) so a custom domain via CNAME is just a routing config, not a rebuild. Position custom domain as a Scale-tier/add-on feature — it's a natural "you've made it" upsell, and building it in now avoids ever having to ask a customer to reprint barcodes already in the field.
- **GTIN check-digit and format validation:** build this carefully and test it thoroughly; a barcode that fails to scan at a real retailer is the single worst first impression Almsby could make.
- **Compressed Digital Link URIs:** GS1's tooling supports a compression scheme for shorter, less-dense QR codes — worth evaluating once you see real-world scan reliability at small print sizes, not necessarily for v1.

---

## 6. AI agent accessibility (Phase 2–4)

Three distinct layers, each with its own timing and effort level. Design for all three from the start — implement in sequence as the product matures.

### Layer 1 — Schema.org structured data on story pages (Phase 2)

The lightest lift and the earliest win. Add schema.org `Product` and `Organization` markup to every public story page at render time. This makes Almsby story pages legible to AI crawlers, search agents, and any system that reads the web without needing an explicit integration — no API key, no authentication, no special access required.

Concretely: a JSON-LD block in the story page's `<head>` with `Product` schema (name, brand, material, country of origin, GTIN) and `Organization` schema for the maker. This is also good for standard SEO and Google's rich results, so it earns its place regardless of AI accessibility specifically. Ship it as part of Phase 2's story page build, not as a separate workstream.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "brand": { "@type": "Brand", "name": "..." },
  "gtin14": "...",
  "countryOfOrigin": "...",
  "material": "..."
}
```

### Layer 2 — Public REST API (Phase 3)

Expose Almsby's internal API routes as a versioned, documented public API. This is the foundation that everything else (MCP, third-party integrations, Zapier/Make automations) builds on — get this right before building anything on top of it.

**Design principles to apply from Phase 1 onward, even before the API is public:**
- Version all internal API routes from day one: `/api/v1/products`, `/api/v1/gtins`, etc. — retrofitting versioning later is painful
- Consistent response shapes across all endpoints (standard envelope: `{ data, error, meta }`)
- API key authentication as a separate auth path alongside session auth — Supabase supports this natively

**Phase 3 scope for the public API:**
- Products: create, read, update, list
- GTINs: read, validate
- Barcodes: generate, retrieve asset URL
- Story pages: read published content
- Compliance status: read per-product and per-business

Write-heavy operations (barcode generation, product creation) are the ones AI agents will most want to automate — prioritize those over read-only endpoints.

### Layer 3 — MCP server (Phase 4)

Model Context Protocol is Anthropic's open standard for giving AI agents structured, tool-based access to external services. An Almsby MCP server would let an AI assistant (Claude, or any MCP-compatible agent) perform Almsby operations on behalf of a maker — checking compliance status, generating barcodes for a new collection, updating story page content — without the maker touching the dashboard at all.

This is the highest-leverage AI accessibility option for Almsby's specific customer base: small makers who'll increasingly run AI assistants to manage their business, and for whom "your new collection needs GTINs — want me to set them up?" is a genuinely compelling value proposition, not just a technical nicety.

**MCP tools worth exposing (based on Phase 1–3 API surface):**
- `list_products` — return products and compliance status for a business
- `generate_barcode` — create a GTIN + barcode for a new product
- `get_compliance_status` — return what's done and what's missing per product or business
- `update_story_page` — let an agent draft or update story page content
- `validate_gtin` — check digit validation for an existing GTIN

**Implementation path:** the MCP server is a thin wrapper over the Phase 3 public API — it translates tool calls into API requests and formats responses for agent consumption. Building it after the public API is stable means it's mostly plumbing, not new logic.

**Timing note:** don't build this until you have real customers and real data about which operations makers actually want to automate. The tool list above is a reasonable guess — validate it against actual usage patterns before building.

### Summary

| Layer | What it enables | When to build | Effort |
|---|---|---|---|
| Schema.org markup | AI crawlers, search agents, rich results | Phase 2 | Low — part of story page build |
| Public REST API | Any integration, automation tool, future MCP | Phase 3 | Medium — versioning + docs |
| MCP server | AI agents acting on behalf of makers | Phase 4 | Low once API exists — mostly plumbing |

---

## 7. Design system

Locked decisions for fonts and color — apply consistently across the dashboard, story pages, and any future marketing surfaces built inside the Next.js app.

### Typography

| Role | Font | Source | Usage |
|---|---|---|---|
| Headings | Bricolage Grotesque | Google Fonts | H1–H4, display text, hero headlines, section titles |
| Body | Albert Sans | Google Fonts | Body copy, UI labels, form fields, captions, all running text |

Load both via Google Fonts in the Next.js app's root layout. Specify weights explicitly to avoid loading the full variable font range unnecessarily:

```html
<!-- In <head> or Next.js font optimization -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Albert+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

Or preferably via Next.js's built-in font optimization (`next/font/google`), which self-hosts and eliminates the Google Fonts round-trip:

```typescript
import { Bricolage_Grotesque, Albert_Sans } from 'next/font/google'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
})

const albert = Albert_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
})
```

### Color system

Four ramps, each with a defined role. Use the role, not the ramp name, when making decisions — if you find yourself reaching outside a ramp's defined role, that's a signal to check in rather than improvise.

```css
/* primary — brand, warmth, marketing surfaces, interactive elements */
--primary-100: #f8f2f3;
--primary-200: #e3d5d6;
--primary-300: #c7aeb0;
--primary-400: #ad8183;
--primary-500: #8e5f6b;
--primary-600: #734253;
--primary-700: #613146;
--primary-800: #592941;
--primary-900: #331323;

/* blue — compliance status, data, informational UI, system feedback */
--blue-100: #eff5f7;
--blue-200: #cfe0e5;
--blue-300: #a6c5ce;
--blue-400: #7faebb;
--blue-500: #538ea1;
--blue-600: #366e83;
--blue-700: #235064;
--blue-800: #153b50;
--blue-900: #0b2433;

/* gold — accents, CTAs, highlights — use sparingly, not as a structural color */
--gold-100: #fff8eb;
--gold-200: #ffe2b3;
--gold-300: #ffcb77;
--gold-400: #f5ad4b;
--gold-500: #db8d24;
--gold-600: #ad690b;
--gold-700: #804b00;
--gold-800: #543000;
--gold-900: #301b00;

/* neutral — UI chrome, text, borders, backgrounds, form elements, disabled states */
--neutral-100: #f8f6f5;
--neutral-200: #ebe6e4;
--neutral-300: #d3cbc8;
--neutral-400: #b5aba7;
--neutral-500: #8c8078;
--neutral-600: #675c55;
--neutral-700: #4a3f3a;
--neutral-800: #302825;
--neutral-900: #1a1512;
```

### Usage guidance

- **Backgrounds:** neutral-100 for app surfaces, primary-100 for brand/marketing surfaces
- **Body text:** neutral-800 on light backgrounds, neutral-100 on dark
- **Headings:** primary-800 or neutral-900 depending on surface warmth
- **Interactive/CTA:** primary-500 to primary-700 range
- **Compliance status UI:** blue ramp — "Sunrise-ready" badges, status indicators, data tables
- **Accent/highlight:** gold-500 sparingly — notification dots, progress indicators, pricing highlights
- **Borders:** neutral-200 to neutral-300
- **Disabled states:** neutral-300 to neutral-400
