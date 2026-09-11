# Quality & Evidence

Quality in Almsby is the evidence that the product works as intended, is understandable to the people using it, and remains faithful to the Product Constitution.

This directory defines **what must be checked, how it must be checked, and what constitutes convincing evidence**.

It does not contain transient run results. Run-specific evidence belongs with the corresponding AI run under `.ai/runs/`.

## Authority

Quality guidance is downstream of product truth and hard constraints:

1. `product/constitution.md`
2. `product/decisions/`
3. `engineering/compliance-requirements.md`
4. `engineering/technical-architecture.md`
5. `ux/` guidance
6. `strategy/`
7. `delivery/`
8. `quality/` protocols and templates

A quality protocol cannot override a product decision or hard engineering/compliance requirement.

## What quality means

An Almsby change is high quality when evidence supports all applicable dimensions:

- **Functional correctness** — behavior works.
- **Reliability** — failures are explicit, recoverable, and do not silently corrupt state.
- **Compliance correctness** — applicable GS1/compliance requirements are respected.
- **Scan/physical correctness** — generated barcodes work on real hardware where applicable.
- **Accessibility** — users can understand and operate the experience.
- **Responsive correctness** — important flows remain usable across supported viewport sizes.
- **UX correctness** — the next step is obvious, cognitive load is controlled, and consequential decisions preserve user understanding and control.
- **Visual quality** — hierarchy, composition, typography, spacing, density, imagery, and responsive behavior form a coherent system.
- **Persona/constitution alignment** — the result makes the user's life easier while preserving understanding and control.
- **Evidence completeness** — claims about completion are backed by inspectable artifacts.

Not every dimension applies to every change. The run should record which checks apply and why.

## Evidence hierarchy

Prefer evidence in this order:

1. **Direct behavioral evidence**
2. **Automated verification**
3. **Browser evidence**
4. **Physical evidence**
5. **Human review**

A passing test is evidence of the behavior it covers; it is not evidence of unrelated quality.

## Evidence rules

Every quality claim should answer:

- What was checked?
- Why does it matter?
- How was it checked?
- What was the result?
- What artifact proves it?
- What remains uncertain?

Do not claim a phase or feature is complete merely because implementation exists.

## Relationship to delivery and AI runs

- `delivery/` defines phase/feature acceptance criteria.
- `guidelines/quality/` defines reusable quality rules and protocols.
- `.ai/runs/<run-id>/` records what actually happened on a particular run.

The separation is intentional:

**quality = how Almsby judges quality**  
**run evidence = what happened this time**

## High-risk areas

Particular care is required for:

- GS1/GTIN logic
- Digital Link resolver behavior
- barcode generation/rendering
- render → decode/verify chains
- physical scanner compatibility
- compliance-related data
- public story-page behavior
- i18n parity where applicable
- consequential AI-assisted decisions

For barcode work, physical verification remains authoritative for claims about real-world scanning.

## Completion language

Agents must distinguish:

- **Implemented** — code/configuration exists.
- **Verified** — applicable check passed.
- **Validated** — evidence supports the intended user/product outcome.
- **Complete** — required implementation, verification, validation, and review are finished.
- **Blocked** — a dependency or decision prevents completion.
- **Unknown** — insufficient evidence exists to make the claim.

Never use “looks good” or “should work” as substitutes for evidence.

## Protocol lifecycle

Update protocols when a recurring failure exposes a missing check, a requirement changes, a supported environment changes, automation can replace a fragile manual step, or a manual check needs clearer instructions.
