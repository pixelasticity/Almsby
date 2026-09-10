---
id: D-004
type: decision
authority: product
status: active
---

# D-004 — Automate work while preserving consequential user control

## Context

Almsby's ambition is to make infrastructure complexity invisible.

Requiring users to perform mechanical work manually creates unnecessary effort.

At the same time, hiding important decisions behind automation can undermine trust and user control.

## Decision

Almsby should automate safe mechanical work while exposing consequential decisions.

For consequential decisions, use the pattern:

> **Detect → Explain → Recommend → Approve**

### Detect

Identify the relevant issue, opportunity, or change.

### Explain

Describe what was found in understandable language.

### Recommend

Provide a sensible recommendation and explain why.

### Approve

Allow the user to approve consequential changes where appropriate.

The amount of interaction should be proportional to the consequence.

## Alternatives considered

### Manual control of everything

Rejected because it places infrastructure complexity in the user's head.

### Fully autonomous automation

Rejected because important changes can have consequences the user should understand and control.

### Confirmation for every action

Rejected because unnecessary confirmation creates friction and trains users to approve without reading.

## Why

This balances automation with the Constitution's requirement to preserve user understanding and control.

## Consequences

- Agents should distinguish safe automation from consequential decisions.
- UI should expose important system reasoning and state.
- Confirmation should be used selectively.
- Background work should report meaningful state honestly.
- Product and engineering reviews should consider the consequence of automated actions.

## Revisit when

Reconsider if a workflow demonstrates that the consequence model or user expectations differ materially from this approach.
