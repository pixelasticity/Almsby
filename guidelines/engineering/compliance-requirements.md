# Almsby — Compliance Requirements Mapping
*What Sunrise 2027 and Digital Product Passport rules actually require, and what that means for the product.*

---

## 1. The honest starting point: two clocks, and for this beachhead, they actually converge

It's tempting to lump "GS1 compliance" and "DPP" together as one wave, but they're not the same regulation and don't run on the same timeline. The good news for a clothing/textile-maker beachhead specifically: textiles is one of the earliest confirmed non-battery DPP categories, so this customer faces real pressure from *both* clocks in a similar window — which is exactly the "two birds" pitch that makes Almsby's positioning work.

| | Sunrise 2027 | EU DPP (ESPR) |
|---|---|---|
| **Who runs it** | GS1 (global standards body) + US retailers | European Commission |
| **What it covers** | Barcode scanning capability at point-of-sale | Product-level sustainability/material data |
| **Applies to** | Essentially all retail products sold via barcode | Only specific product categories, phased in |
| **Mandatory?** | Not a hard legal mandate — a coordinated industry deadline | Legally mandatory once a category's delegated act takes effect |
| **Your beachhead's exposure** | High — any clothing/textile maker selling through retail will be affected | Real and comparatively near-term — textiles is one of the first categories in scope, though exact enforcement timing is still firming up (see below) |

---

## 2. Sunrise 2027 — what it actually requires

- <cite index="8-1">By the end of December 2027, retailer point-of-sale systems are expected to accept 2D barcodes.</cite>
- <cite index="3-1">GS1 recommends dual-marking — carrying both the legacy EAN/UPC and a 2D code — during the transition period,</cite> so products remain sellable everywhere regardless of which POS systems have upgraded.
- <cite index="4-1">Brands are expected to add 2D barcodes to existing packaging, ensure any QR codes meet GS1 Digital Link standards, and include the GTIN.</cite>
- <cite index="7-1">2026 is described as the critical data audit year — brands that haven't structured their SKU data for this transition risk products failing at checkout once retailers complete their upgrades.</cite>

**What this means for Almsby's feature set (confirms the MVP scope doc):**
- GTIN assignment/import — non-negotiable, this is the foundation everything else sits on
- Dual-marking barcode generation (legacy + 2D, GS1 Digital Link–encoded)
- Barcode validation before print
- A compliance status view per product ("Sunrise-ready" / "needs attention")

This is the tier your pricing should be built around — it's the thing with real, near-term consequences (delisting risk) attached to it.

---

## 3. EU DPP (ESPR) — what it actually requires, and when

<cite index="16-1">There is no single DPP deadline — it phases in product group by product group, each on its own delegated act and compliance date.</cite> Confirmed timeline so far:

- **Batteries** (EV, industrial >2kWh, light transport): <cite index="15-1">mandatory from February 18, 2027 under the EU Battery Regulation — the first fully mandatory DPP, functioning as the template for every sector that follows.</cite>
- **Textiles** (your beachhead's category): <cite index="12-1">requirements begin around 2027,</cite> though sources vary on exact enforcement — one places <cite index="14-1">the textile delegated act around 2027 with mandatory passports realistically no earlier than 2028,</cite> while another projects <cite index="16-1">textile passports landing closer to late 2028/2029.</cite> Treat "2027-2028 delegated act, 2028-2029 realistic enforcement" as the working assumption, and revisit as the delegated act firms up.
- **Furniture**: also flagged for 2027 in some sources but generally trails textiles — a natural next vertical once Almsby is proven, not a launch priority.
- **Iron, steel, aluminium**: <cite index="12-1">expected from 2028.</cite>
- **Electronics, ICT, batteries (broader)**: <cite index="12-1">phased in 2028–2029.</cite>
- **Construction products**: <cite index="12-1">handled separately, likely 2029–2030.</cite>
- <cite index="14-1">The framework itself — including the EU Central DPP Registry — went live with ESPR's full application on July 19, 2026, but this is the infrastructure switch-on, not a product obligation; no product-specific delegated act has entered into force yet except batteries.</cite> This is the important nuance: even for textiles, the *legal* enforcement date isn't locked yet. The pressure is real but the exact date is still moving — don't market a specific compliance deadline you can't back up.

**What this means for Almsby:**
- You can lead with genuine dual urgency for this beachhead: "Sunrise 2027 is locking in a hard barcode deadline now, and the EU passport requirement for textiles is landing right behind it." That's a true, differentiated pitch — but be precise that the DPP *delegated act* isn't final yet, so avoid quoting a specific enforcement date until the Commission confirms one.
- Build the story-page infrastructure **DPP-shaped from day one** — material composition, sourcing, sustainability/end-of-life fields — since this customer will need those fields for real compliance, not just brand storytelling. <cite index="14-1">GS1 Digital Link, with GTIN as the identifier and a QR code resolving to the record, is now explicitly recognized as a valid identifier pattern under ESPR,</cite> so the architecture built for Sunrise 2027 barcodes is already the right technical foundation for DPP.
- This is your "work my way up" path: launch with clothing/textile makers where both clocks apply, then expand into furniture and other categories as their DPP timelines firm up, without rearchitecting anything.

---

## 4. Feature-to-requirement map

| Feature | Driven by | Urgency for beachhead customer |
|---|---|---|
| GTIN assignment/import | Sunrise 2027 (foundational) | High — needed regardless of DPP |
| Dual-marking 2D barcode generation | Sunrise 2027 | High — real 2027 deadline |
| Barcode print validation | Sunrise 2027 (GS1 print quality spec) | Medium — prevents costly reprints |
| Story page / origin content | Brand differentiation now, real DPP obligation soon | High now (engagement), rising fast (compliance, ~2027-2029) |
| Structured material/sourcing data fields | Near-term DPP readiness for textiles | Medium-high today, high as the textile delegated act firms up |
| Compliance status dashboard | Sunrise 2027 | High — retention driver as 2027 approaches |

---

## 5. What to say (and not say) to customers

**Say:** "Sunrise 2027 is coming for every barcode, including yours — let's get you dual-marked and ready." This is true, urgent, and applies to essentially everyone.

**Don't say:** a specific enforcement date for textile DPPs ("by [exact date] you'll be required to..."). The delegated act isn't finalized, so a precise date is a claim you can't back up yet — use "in the next 2-3 years" or "as the EU finalizes the textile passport rules" instead.

**Do say, for the story page:** "This is the same infrastructure the EU is standardizing on for textile product transparency — get it built now, and you're compliant whenever the deadline lands, instead of scrambling later." This is honest, genuinely urgent, and turns the story page into a compliance asset, not just a nice-to-have.

---

## 6. Open item to track

The textile delegated act is not finalized — treat every date in this document as a working assumption, not a locked deadline. Worth a standing note to re-check the European Commission's ESPR page and GS1's DPP standards updates periodically (roughly every 3 months given how close this is to launch) rather than treating this document as permanently accurate. This is the single most important thing to keep current, since your core pitch depends on getting this timeline right.
