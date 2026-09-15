# Browser Evidence System

Step 14 makes browser verification a first-class completion dependency.

The browser layer produces evidence; the deterministic validator decides whether
that evidence is structurally valid and sufficient for the applicable gate.
Playwright is the preferred provider, but the evidence contract is
provider-neutral.

## Core rule

> A browser claim is not complete because an agent says Playwright ran. It is
> complete only when the current run contains valid, attributable browser
> evidence for every required scenario.

## Flow

```text
Playwright / other provider
        ↓
normalized browser evidence
        ↓
browser validator
        ↓
browser-validation-report.json
        ↓
project.yaml browserVerification
        ↓
watchdog
        ↓
completion gate
```

## Responsibilities

- Browser provider: execute scenarios and produce raw results/artifacts.
- Evidence adapter: normalize provider output into the browser evidence schema.
- Deterministic validator: verify identity, paths, freshness, catalog
  membership, scenario coverage, and result semantics.
- PM: determine applicable scenarios and interpret product meaning.
- Watchdog: consume the validator result and prevent false readiness.
- Critic/Design/UX agents: judge quality; they do not manufacture verification
  evidence.
- Human: approve consequential product/design decisions where required.

## Current-run rule

Browser evidence is run-scoped by default. Reusing another run's evidence is
prohibited unless an explicit contract introduces a pinned reusable fixture.
