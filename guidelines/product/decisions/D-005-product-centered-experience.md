---
id: D-005
type: decision
authority: product
status: active
---

# D-005 — Product-centered experience

## Context

The technical system contains identifiers, barcodes, Digital Links, compliance data, and other infrastructure concepts.

Users generally approach Almsby because they have a product they need to manage, identify, prepare, publish, or communicate.

## Decision

The **Product is the primary user-facing mental model**.

Users should generally begin from and reason about their Product rather than from infrastructure concepts such as GTINs or Digital Links.

Technical concepts should appear when they become relevant to the user's task.

## Alternatives considered

### Identifier-first UX

Rejected because it makes the user's mental model match the system's infrastructure rather than the user's goal.

### Compliance-first navigation model

Rejected as the permanent product-wide mental model even though compliance is an important entry point.

### Fully abstracted technical concepts

Not selected because experts sometimes need to inspect and work with technical details.

## Why

The Constitution requires Almsby to put complexity in the product rather than in the user's head.

The product should hide unnecessary complexity without hiding information users legitimately need.

## Consequences

- Product should anchor dashboard and management experiences.
- GTIN and Digital Link concepts should be introduced contextually.
- Technical details should remain inspectable when useful.
- Domain terminology should remain consistent across product, UX, and AI.
- Public experiences should preserve the connection to the identified Product.

## Revisit when

Reconsider if the target market or primary job changes enough that an infrastructure-first mental model becomes demonstrably more useful.
