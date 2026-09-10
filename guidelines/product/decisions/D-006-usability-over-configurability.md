---
id: D-006
type: decision
authority: product
status: active
---

# D-006 — Usability over configurability

## Context

A product serving businesses can easily accumulate settings, customization options, and enterprise configuration.

Configurability can increase theoretical flexibility while simultaneously increasing cognitive load and implementation complexity.

## Decision

Almsby should prefer **opinionated, understandable defaults over extensive configurability**.

Configuration should exist when users have a meaningful need for control, not simply because the system can expose an option.

## Alternatives considered

### Maximum configurability

Rejected because it risks turning Almsby into an enterprise configuration surface rather than a product that makes complexity invisible.

### No customization

Rejected because some product and brand expression is valuable, particularly for customer-facing Story Pages.

### Opinionated defaults with focused escape hatches

Selected because it balances usability with legitimate user needs.

## Why

The Constitution explicitly rejects enterprise configurability over usability.

The product should make good choices on the user's behalf while preserving appropriate control.

## Consequences

- Defaults should be deliberate.
- Every setting should justify its cognitive cost.
- Customization should remain focused.
- Story Pages may support light-touch branding rather than unrestricted page building.
- Product teams should resist adding settings merely to satisfy hypothetical use cases.

## Revisit when

Reconsider when strong user evidence demonstrates a recurring need that cannot reasonably be served through existing defaults or focused customization.
