# Internationalization (i18n)

## Library: next-intl

Chosen over Paraglide (inlang) and react-i18next for this stack specifically. All three are viable; next-intl wins on ecosystem maturity and App Router fit, which matters most for a small team that needs to debug unfamiliar edge cases quickly rather than adopt the most powerful tool available. Paraglide was evaluated and tested first — the deciding factor against it in practice was Next.js routing integration: next-intl has an officially-maintained routing adapter, while Paraglide would have required custom cookie-locale and prebuild-compile wiring that the team would own and maintain long-term. That real-world testing outweighed Paraglide's theoretical advantages on paper.

| Criterion | next-intl | Paraglide (inlang) | react-i18next |
|---|---|---|---|
| Human-readable | Plain JSON per locale, namespaced keys | Fluent `.ftl` syntax — powerful pluralization, less instantly readable | JSON possible, but App Router setup is bolted-on |
| AI-maintainable | Strong | Strongest — designed for AI edit loops | Weak — runtime providers, config sprawl |
| App Router native | Yes (RSC + client islands, `useTranslations`) | Yes (compiled, framework-agnostic), but no officially-maintained Next.js routing adapter | Legacy patterns, awkward with RSC |
| Drift protection | Lint + typed keys — missing/extra keys fail typecheck/CI | inlang lint (commercial product around it) | Manual |

**Trade-off worth knowing:** Fluent's (Paraglide's) plural and gender handling is more powerful than next-intl's — relevant for structured data like units, dates, and material percentages across languages with complex pluralization rules. If that gap becomes a real limitation as more languages roll out, Paraglide remains a documented option to revisit — the comparison above still applies.

## Language rollout priority

Not a population ranking — weighted by actual relevance to Almsby's compliance driver and customer base.

**Tier 1 — ship with MVP:**
- English (dashboard + story pages)

**Tier 2 — story pages first, dashboard as demand requires:**
- **Spanish** — large Spanish-speaking population within the existing US customer base (customers, suppliers, family members involved in small maker businesses), plus opens Spain (EU/DPP-relevant) and Latin America
- **French** — relevant for the EU (France, Belgium, Luxembourg), and notably for **Canada**, a genuinely underrated near-term expansion market: culturally/logistically close to the US, bilingual by law, not tied to the EU DPP timeline at all

**Tier 3 — elevated above population-only ranking, tied to actual customer base or cultural fit:**
- **Italian** — Italy is one of Europe's major textile/apparel manufacturing and design hubs (Milan, Prato). For a textile/apparel-focused beachhead, this is adjacency to the actual customer base, not just a market-size play.
- **German** — EU's largest economy, and historically the most aggressive enforcer of environmental/product regulation in the bloc. If any country moves first and hardest on real DPP enforcement, Germany is a reasonable bet — treat this as compliance-driven priority, not population-driven.
- **Japanese** — no DPP/compliance driver, but a genuinely strong cultural fit: Japanese consumer culture has deep, well-documented reverence for craftsmanship and origin storytelling — part of why heritage denim, workwear, and "Americana" brands perform disproportionately well there. This is product-market fit on the *story* half of Almsby's identity specifically, which is a different and legitimate reason to prioritize a language versus regulation or population alone.

**Tier 4 — later, no committed timeline, different reasoning each:**
- **Arabic** — large, growing e-commerce market, but no tie to the DPP compliance driver specifically
- **Chinese** — different relationship than the others: less likely to be end-consumer story-page traffic, more likely relevant if makers' suppliers/manufacturing partners need to read compliance data. Revisit only if that usage pattern actually appears.
- **Korean** — K-fashion is a real export-relevant market, currently speculative

**Flagged separately — requires legal review before any prioritization, not just "later":**
- **Russian** — current US and EU sanctions regimes place substantial restrictions on trade with Russia. For a company whose core identity is trade compliance, this is a legal/reputational consideration that sits outside normal market-sizing logic — do not prioritize without specific legal review, regardless of market size or demand signals.

### Reusable scoring framework for future language candidates

Rather than evaluating each new candidate language ad hoc, score any future addition against these four questions:

| Question | Why it matters |
|---|---|
| **Compliance driver present?** (DPP, Sunrise-2027-equivalent, or regional regulation) | Regulatory urgency is the sharpest, most defensible reason to prioritize — matches Almsby's core positioning |
| **Textile/fashion industry adjacency?** (manufacturing hub, design capital, or trade relevance to the beachhead customer) | Puts the language near the actual customer base, not just a large population |
| **Cultural fit with "story-driven" positioning?** (consumer culture that values provenance/craftsmanship narrative) | Matches the brand half of Almsby's identity, independent of compliance |
| **Any trade, sanctions, or legal complications?** | A hard gate, not a scoring factor — a "yes" here means legal review before any other consideration applies, regardless of how well the language scores elsewhere |

A language with a "yes" on any of the first three is a reasonable candidate for the working tier list. A "yes" on the fourth overrides everything else until resolved.

## Dashboard vs. story-page translation — decoupled, not simultaneous

These are two different translation surfaces with different urgency and different rigor requirements. Do not treat them as one workstream.

- **Dashboard (maker-facing UI):** low-stakes if imperfect — a slightly awkward translated button label doesn't break anything. Needed only when actually selling into non-English-speaking maker markets, which is a slower-moving requirement than the story-page case.
- **Story pages (consumer-facing):** a US maker may want Spanish/French story pages long before they'd ever need a non-English dashboard, since *their customers* read those languages even if the maker doesn't. This likely needs to happen sooner than dashboard translation.
- **Compliance-critical fields (country of origin, material composition, any DPP-required data):** not a UX nicety — a mistranslation here is a potential compliance problem, not just an awkward sentence. These fields should get professional translation/review, not machine translation or AI-assisted drafts without human check, regardless of how the rest of the UI is handled.

## Open questions to resolve before Phase 2 story pages ship

- **Locale detection strategy for the resolver:** when a barcode gets scanned in France, does the story page auto-detect locale from browser/Accept-Language headers, or does the maker set a fixed language per product? This is a product decision hiding inside a technical library choice — decide explicitly rather than defaulting to whatever next-intl does out of the box.
- **RSC rendering path for the resolver-linked story page specifically:** confirm next-intl's React Server Component support handles the public, ISR-cached story-page case as cleanly as it handles the authenticated dashboard case — most next-intl examples assume the dashboard pattern, not a public high-traffic resolver target.
- **Translation workflow:** who translates what, and how does content flow from a maker's English input into other languages — AI-assisted draft with human review, professional translation service, or maker-provided translations? Different answers likely apply to dashboard UI strings (can be AI-assisted) vs. compliance-critical product fields (should not be).