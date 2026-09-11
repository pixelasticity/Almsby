# UX

UX guidance defines how Almsby should behave and communicate from the user's perspective.

It is intentionally separate from engineering architecture and visual implementation details.

## Purpose

UX guidance helps agents and humans answer:

- What should the user understand?
- What should the user do next?
- What information belongs on screen now?
- What can the system discover, infer, or automate?
- Where must the user remain informed and in control?
- How should complexity be progressively disclosed?
- How should the experience behave when something is incomplete, uncertain, or fails?

## Authority

UX guidance is downstream of:

1. `product/constitution.md`
2. `product/decisions/`
3. `engineering/compliance-requirements.md`
4. domain definitions
5. strategy and delivery requirements

UX guidance must not invent product policy or contradict hard constraints.

## Relationship to other knowledge

- `ux/patterns/` — reusable interaction patterns.
- `ux/design-system/` — reusable visual/interface foundations.
- `product/` — why the product exists and what it believes.
- `engineering/` — how the system is technically built.
- `delivery/` — what is being built in a particular phase.
- `.ai/` — how agents execute work.

## Core UX principles

### Make the next step obvious

A user should rarely have to infer what the product expects them to do next.

### Hide bureaucracy, not meaning

Complexity should be handled by the product wherever possible, but consequential decisions and important system state must remain understandable.

### Ask, don't interrogate

Only ask for information that is genuinely needed. Prefer discovery, inference, sensible defaults, and progressive disclosure.

### Start with the user's goal

Use the user's language and mental model before introducing GS1, compliance, technical, or implementation terminology.

### Automate work; expose decisions

Automation should remove repetitive effort. When an automated action has meaningful consequences, explain what happened and preserve appropriate user control.

### Preserve authorship

For maker-created storytelling, the system should organize, clarify, and amplify the maker's knowledge and voice rather than replace it with generic marketing language.

### Honest states

Draft, published, processing, failed, incomplete, and blocked are different states. The interface should not blur them.

### Reliability builds trust

Error handling should tell the user what happened, what is safe, and what they can do next.

## UX review test

Before accepting a significant interaction change, ask:

> Does this make the user's life easier while preserving their understanding and control?

If not, the design needs another pass.
