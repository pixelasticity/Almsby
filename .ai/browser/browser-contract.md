# Browser Evidence Contract

**Schema version:** 1.0
**Status:** active

## Purpose

Define the minimum evidence required to claim that a browser-visible experience has been verified.

## Evidence identity

Every browser evidence record MUST include:

- `schema_version`
- `run_id`
- `scenario_id`
- `provider`
- `route`
- `viewport.width`
- `viewport.height`
- `started_at`
- `finished_at`
- `result`
- `artifacts`
- `actions` or `assertions`

`provider` SHOULD be `playwright` for the standard implementation. Other providers are allowed only if their output can satisfy this contract.

## Result semantics

- `passed`: scenario completed and all declared assertions passed.
- `failed`: scenario executed but a required assertion failed.
- `blocked`: scenario could not execute because a prerequisite was unavailable.
- `unknown`: result cannot be independently established.

Only `passed` can satisfy a required scenario.

## Artifact requirements

Screenshot artifacts MUST identify a file inside the current run directory. Accessibility snapshots MUST be attributable to the same scenario. Raw provider logs may be retained, but raw logs alone do not satisfy a scenario unless the contract explicitly identifies the assertion they prove.

## No implicit proof

A screenshot does not prove accessibility. An accessibility snapshot does not prove visual quality. A navigation result does not prove an interaction. Each claim requires the corresponding scenario/assertion.

## Freshness

Evidence must be generated during the current run unless a contract explicitly permits a pinned reusable fixture. Reusing stale evidence to satisfy a new implementation is prohibited.
