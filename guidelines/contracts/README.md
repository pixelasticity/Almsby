# Almsby AI Workflow Contracts

**Purpose:** define the stable interfaces that connect product truth to design, implementation, review, evidence, and autonomous execution.

These contracts are the bridge between `guidelines/` and `.ai/`.

They answer a different question from ordinary guidelines:

- Guidelines explain **what Almsby believes and how good work should behave**.
- Contracts define **what an agent must provide or consume at a boundary**.
- `.ai/` defines **how agents execute those contracts**.

## Contract inventory

| Contract | Purpose | Primary consumers |
|---|---|---|
| `design-brief.md` | Defines the minimum design/UX input required before implementation | PM, Design Director, UX, Visual, Implementation |
| `definition-of-done.yaml` | Defines machine-checkable completion requirements | PM, Watchdog, Implementation, Critic |
| `review-rubric.md` | Defines shared review dimensions and severity | UX, Visual, Critic, PM |
| `agent-capability-matrix.yaml` | Defines role authority and boundaries | PM, all agents, Watchdog |
| `change-impact-protocol.md` | Determines how much analysis/review a change requires | PM, Implementation, Watchdog |
| `contract-versioning.md` | Protects consumers from incompatible contract changes | `.ai/` infrastructure |

## Authority model

The contracts are not above product truth.

The effective authority hierarchy is:

1. `product/constitution.md`
2. `product/decisions/`
3. hard engineering/compliance constraints
4. domain definitions
5. UX/design-system guidance
6. strategy
7. delivery requirements
8. quality protocols
9. AI workflow contracts
10. implementation details

If a contract conflicts with a higher-authority source, the conflict must be surfaced rather than silently resolved.

## General contract rules

### 1. Explicitness beats inference

An agent may infer low-risk, reversible implementation details.

It must not silently infer consequential product policy, compliance interpretation, authorship decisions, or irreversible behavior.

### 2. Evidence beats assertion

A status is meaningful only when its required evidence exists.

### 3. Applicability is explicit

A requirement may be `not_applicable`, but that determination must be recorded. An agent must not omit a check merely because it is inconvenient.

### 4. Contracts are interfaces

A producer must satisfy the contract before a consumer relies on its output.

### 5. Human authority remains real

Autonomy is bounded. Where the repository's policies require a human gate, no agent can manufacture approval.

## Directory ownership

`guidelines/contracts/` contains the durable contract definitions.

`.ai/` contains their operational consumers:

- agent instructions;
- schemas;
- state machine;
- orchestration;
- watchdog logic;
- run templates.

A change to a contract should therefore trigger a change-impact review of `.ai/` consumers.
