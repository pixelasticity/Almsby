# Almsby Guidelines

This directory is the **product knowledge base and source-of-truth hierarchy for Almsby**.

It describes what Almsby is, who it serves, what it believes, what constraints it operates under, and what good product, UX, engineering, and delivery decisions look like.

These documents are intended to be consumed by:

* Product and design
* Engineers
* AI agents and subagents
* Reviewers and critics
* Future contributors

The goal is not to document every implementation detail. The goal is to give humans and agents enough durable context to make **consistent, high-quality decisions without repeatedly rediscovering why Almsby works the way it does**.

---

## 1. Authority hierarchy

Not all documents in `guidelines/` have equal authority.

When two documents appear to conflict, resolve the conflict according to this hierarchy:

1. **Product Constitution**
2. **Explicit product decisions**
3. **Hard engineering/compliance constraints**
4. **UX principles and patterns**
5. **Strategy**
6. **Delivery plans and phase briefs**
7. **Quality protocols and evidence**
8. **Technical debt and other non-authoritative observations**

A lower-level document must not silently override a higher-level source of truth.

If a conflict cannot be resolved from the existing documentation, **stop and surface the conflict rather than inventing a resolution**.

---

## 2. Product truth

### `product/`

The product directory answers:

> **What is Almsby, who is it for, and what principles should govern product decisions?**

### Constitution

`product/constitution.md`

The highest-level product authority.

It defines:

* Almsby's ambition and promise
* Core product beliefs
* What Almsby does and does not want to become
* Emotional outcomes for users
* Product decision principles
* The simplest test for evaluating product decisions

The Constitution should be treated as durable product truth.

AI agents may **interpret and apply** it. They may propose changes to it, but must not silently modify it.

### Personas

`product/personas/`

Personas describe the users and user needs currently being designed around.

The current primary persona is:

`product/personas/craft-obsessed-maker.md`

Personas are not immutable facts about customers. Where a persona contains hypotheses or assumptions, its confidence and evidence should be respected.

### Domain

`product/domain/`

This directory defines Almsby's important business concepts in product language.

Examples include:

* Product
* Business
* GTIN
* Barcode
* Digital Product Identity
* Story
* Digital Product Passport
* Compliance

Domain definitions should explain **what a concept means to the business and product**, not reproduce database schemas or implementation details.

### Decisions

`product/decisions/`

Durable product decisions belong here.

A decision should capture:

* The decision
* Why it was made
* Important alternatives considered
* Consequences
* What would justify revisiting it

The purpose is to prevent agents and contributors from repeatedly reopening decisions that have already been intentionally settled.

### Research

`product/research/`

Research contains evidence gathered about users, markets, competitors, regulations, or other external realities.

Research is evidence.

A persona or product belief may be derived from research, but should not be confused with the research itself.

When evidence contradicts an existing assumption, the appropriate response is to reconsider the relevant product belief or decision—not silently rewrite the evidence.

---

## 3. Strategy

### `strategy/`

Strategy answers:

> **Where is Almsby going, who is it trying to serve, and what are we choosing to prioritize?**

Current strategic documents include:

* `one-pager.md` — concise description of the product and opportunity
* `mvp-scope.md` — what belongs in the MVP and what does not
* `gtm-plan.md` — go-to-market direction and early commercial assumptions
* `roadmap.md` — product/engineering sequencing and longer-term build direction

Strategy should guide prioritization without overriding the Constitution or hard technical/compliance constraints.

The roadmap is a plan, not a promise that every item must be built regardless of evidence.

---

## 4. Engineering

### `engineering/`

Engineering documentation answers:

> **What technical and regulatory constraints must the product satisfy, and how is the system structured?**

### Technical architecture

`engineering/technical-architecture.md`

Describes the system architecture, major technologies, data relationships, integration boundaries, and technical direction.

It should remain focused on architecture rather than becoming the home for UX, visual design, or operational runbooks.

### Compliance

`engineering/compliance/`

Contains hard regulatory and standards-related constraints.

Compliance requirements are authoritative constraints on the product.

Where requirements depend on evolving external standards or regulations, documents must record their source and freshness so that agents do not treat potentially outdated information as permanent truth.

### Database / operations

Operational database workflows belong here.

These documents describe how contributors safely work with environments, migrations, resets, staging, and production.

They are **procedural guidance**, not product architecture.

### Technical debt

`engineering/technical-debt.md`

Technical debt records known implementation issues, observations, and cleanup opportunities.

Technical debt is not a product requirement and must not be treated as one.

---

## 5. UX

### `ux/`

The UX directory answers:

> **How should Almsby behave and communicate so that the product remains understandable, trustworthy, and useful?**

UX guidance should operationalize the product Constitution rather than duplicate it.

### Principles

`ux/principles.md`

Defines practical UX principles derived from the Constitution.

These should help an agent answer questions such as:

* What should the next step be?
* What should be automated?
* What should require user approval?
* How much information should be shown?
* When should complexity be hidden?
* How should errors be explained?
* How should the product preserve user understanding and control?

### Patterns

`ux/patterns/`

Reusable interaction patterns belong here.

Patterns should describe **when and why** a pattern should be used, not merely prescribe a visual implementation.

### Design system

`ux/design-system/`

Visual foundations and reusable interface rules belong here.

This includes, as appropriate:

* Typography
* Color
* Spacing
* Layout
* Components
* States
* Responsive behavior
* Composition
* Imagery

The design system should support a coherent Almsby product rather than become a generic component catalog.

---

## 6. Delivery

### `delivery/`

Delivery documents answer:

> **What are we building now, and what must be true for the work to be considered complete?**

Phase briefs are implementation-oriented specifications.

Current phases include:

* `delivery/phase0/` — foundation
* `delivery/phase1/` — GTIN, barcode, Digital Link, and verification
* `delivery/phase2/` — story pages and CMS

A phase brief may contain detailed implementation requirements, but it does not automatically become permanent product truth.

When a phase discovers a durable product or engineering decision, that decision should be recorded in the appropriate authoritative location.

---

## 7. Quality

### `quality/`

Quality documentation answers:

> **How do we prove that Almsby actually works?**

Quality material should distinguish between:

* **Protocols** — how something should be tested
* **Evidence** — what actually happened during a particular verification
* **Requirements** — what must be true

For example, a physical barcode scanning protocol belongs in `quality/protocols/`.

The results of a particular scan session are evidence, not a permanent product guideline.

Evidence associated with a specific AI-assisted run should generally live with that run under `.ai/runs/`.

---

## 8. Guidelines versus AI execution

`guidelines/` describes **what Almsby is and what good decisions look like**.

It should not become the place where AI-agent behavior, orchestration, task state, or run artifacts are stored.

Those concerns belong in `.ai/`.

In particular:

```text
guidelines/
    Product and project knowledge
    Durable constraints
    Decisions
    UX and engineering guidance
    Quality standards

.ai/
    Agent definitions
    Agent instructions
    Workflows
    Project-manager state
    Run state
    Execution artifacts
    Critiques
    Screenshots
    Verification results
```

This separation is intentional.

An AI agent should be able to read `guidelines/` to understand Almsby without needing to understand the machinery used to execute the work.

---

## 9. Document metadata

Documents that participate in the source-of-truth hierarchy should use front matter where useful.

Recommended fields:

```yaml
---
id: example-document
type: product_truth
authority: product
status: active
review:
  required: true
  cadence: quarterly
---
```

### `type`

Use the type that best describes the document:

* `product_truth`
* `persona`
* `domain_definition`
* `decision`
* `strategy`
* `technical_constraint`
* `architecture`
* `ux_guideline`
* `delivery_plan`
* `quality_protocol`
* `evidence`
* `backlog`
* `non_authoritative`

### `authority`

Use:

* `highest`
* `product`
* `engineering`
* `ux`
* `implementation`
* `evidence`
* `non_authoritative`

### `status`

Use:

* `draft`
* `active`
* `superseded`
* `historical`

### Review

Documents containing information that can become stale should declare an appropriate review cadence.

Examples:

* Regulatory requirements: periodic review
* Technical architecture: review when major architecture changes
* Personas: review when research changes assumptions
* Decisions: review only when their underlying assumptions change

Metadata should clarify a document's role; it should not become bureaucracy for its own sake.

---

## 10. How agents should use these guidelines

Agents should **read before acting**.

For any meaningful product or implementation task:

1. Identify the relevant product and strategy context.
2. Check the Constitution.
3. Check applicable product decisions.
4. Identify hard engineering/compliance constraints.
5. Read relevant UX guidance.
6. Read the current delivery brief or task specification.
7. Check existing quality requirements and evidence where relevant.
8. Only then propose or implement a solution.

Agents should not assume that the nearest or most recently edited document is the highest authority.

### When documents conflict

Do not silently choose whichever document is convenient.

Instead:

1. Identify the conflicting statements.
2. Determine their authority levels.
3. Apply the authority hierarchy.
4. If the conflict remains unresolved, record it as a decision or escalation rather than guessing.

### When requirements are missing

Do not invent product policy simply because an implementation needs a decision.

An agent may make an implementation choice when it is within existing authority.

If the choice changes product behavior, user expectations, compliance posture, or another durable principle, it should be surfaced for an appropriate product decision.

---

## 11. Writing new guidelines

New documentation should earn its place.

Before creating a new guideline, ask:

> **Does this capture durable knowledge that another person or agent will need again?**

If not, it may belong in:

* a phase brief
* a task
* a run artifact
* a decision record
* technical debt
* research
* code documentation

Avoid creating multiple documents that say essentially the same thing.

Prefer one authoritative document and references to it.

---

## 12. Keeping the knowledge base healthy

The guidelines directory should remain:

* **Authoritative** — it is clear which document wins
* **Understandable** — humans can navigate it without knowing the repository internals
* **Machine-readable** — agents can determine document purpose and authority
* **Current** — stale constraints are identifiable
* **Non-duplicative** — important rules have one home
* **Evidence-aware** — assumptions can be distinguished from facts
* **Actionable** — guidance helps people make decisions

When a document becomes obsolete, mark it `superseded` or `historical` rather than leaving competing active guidance in place.

When a durable decision emerges from implementation or research, promote it into the appropriate authoritative location.

---

## 13. The simplest rule

When in doubt, return to the product Constitution:

> **Does this make the user's life easier while preserving their understanding and control?**

That question is more important than any individual framework, implementation pattern, visual trend, or agent preference.
