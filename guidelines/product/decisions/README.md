---
id: product-decisions
type: decision
authority: product
status: active
audience:
  - product
  - design
  - engineering
  - all_agents
---

# Product Decisions

This directory records **durable product decisions** that should not be casually reopened.

A decision exists when Almsby has intentionally chosen one direction over meaningful alternatives and that choice should constrain future work.

The purpose is memory:

> **Agents should not rediscover a decision that Almsby has already made.**

## What belongs here

Record decisions that affect:

- Product direction
- User experience
- Product positioning
- Core workflows
- Important product boundaries
- Durable AI behavior
- Major prioritization choices

Examples:

- Why compliance is an entry point rather than the entire product
- Why Story is a core product experience
- Why AI should preserve authorship
- Why consequential automation follows Detect → Explain → Recommend → Approve

## What does not belong here

Do not use this directory for:

- Temporary implementation choices
- Individual coding tasks
- Bug fixes
- Technical debt
- Meeting notes
- Research evidence
- Regulatory requirements
- Detailed architecture

Technical decisions belong in the appropriate engineering documentation or decision record.

Research belongs in `product/research/`.

Implementation state belongs in delivery/run artifacts.

## Decision authority

A decision record explains an intentional product choice. It does not override the Product Constitution.

The authority relationship is:

```text
Product Constitution
        ↓
Product Decisions
        ↓
Strategy / UX / Delivery
        ↓
Implementation
```

If a decision conflicts with the Constitution, the Constitution wins and the conflict should be surfaced.

## Reopening a decision

A decision should be reconsidered when:

- New evidence invalidates an important assumption
- The Constitution changes
- A hard external constraint changes
- The original consequences are materially different from expected
- The product's target user or job changes
- Implementation reveals a fundamental problem with the decision

Do not reopen a decision merely because another option seems interesting.

When reopening one, preserve the original record and create a clear revision or successor decision rather than silently rewriting history.

## Required structure

Decision records should normally contain:

1. Context
2. Decision
3. Alternatives considered
4. Why
5. Consequences
6. Revisit when

Keep records concise enough that an agent can understand the decision quickly.

---

# Current decision index

- `D-001` — Compliance-first entry, broader product destination
- `D-002` — Story as a core product experience
- `D-003` — Maker voice and authorship remain primary
- `D-004` — Automate work while preserving consequential user control
- `D-005` — Product-centered experience
- `D-006` — Avoid enterprise configurability as a substitute for usability
