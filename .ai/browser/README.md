# Browser Evidence System

Step 14 makes browser verification a first-class completion dependency.

The browser layer produces evidence; the deterministic validator decides whether that evidence is structurally valid and sufficient for the applicable completion gate. Playwright is the preferred provider, but the evidence contract is provider-neutral.

## Core rule

> A browser claim is not complete because an agent says Playwright ran. It is complete only when the run contains valid, attributable browser evidence for every required scenario.

## Responsibilities

- Browser provider: execute scenarios and produce raw results/artifacts.
- Evidence adapter: normalize provider output into the Almsby evidence contract.
- Deterministic validator: verify identity, paths, freshness, scenario coverage, and result semantics.
- PM: determine which scenarios are applicable and interpret product meaning.
- Critic/Design/UX agents: judge quality; they do not manufacture verification evidence.
- Human: approve consequential product/design decisions where required.
