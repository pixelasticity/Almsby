# Deterministic Watchdog Contract

**Schema version:** 1.0
**Authority:** execution infrastructure
**Status:** active

## Purpose

The watchdog is deterministic infrastructure that verifies whether an AI run is internally coherent, active, and supported by the evidence required by the authoritative contracts.

It does **not** judge product quality, visual taste, UX quality, or semantic correctness. Those remain agent/human responsibilities.

## Non-negotiable properties

1. No LLM is required to determine whether a watchdog check passed.
2. The watchdog never treats an agent assertion as evidence by itself.
3. Required evidence is fail-closed: missing, unknown, failed, blocked, stale, malformed, or contradicted evidence cannot satisfy a required gate.
4. A watchdog report is an observation, not authority over the product contracts.
5. The watchdog must never silently repair, rewrite, or promote run state.
6. The host/orchestrator is responsible for enforcing non-zero watchdog results.
7. Watchdog checks must be reproducible from the run directory, repository, configuration, and current time supplied to the checker.

## Check classes

### State integrity

Verify:

- state parses and conforms to the execution schema;
- run ID matches the requested run;
- status and phase are legal;
- required top-level state fields exist;
- required applicability decisions are explicit rather than inferred;
- timestamps are parseable and internally sane;
- timestamps do not claim future events beyond the allowed clock-skew window;
- `lastMeaningfulProgressAt` does not precede run creation;
- attempt counters are non-negative integers;
- contract hashes remain valid;
- approval is never synthesized by an agent.

### Transition integrity

The watchdog validates transitions recorded in the run event ledger. Legal transitions are defined in `state-transition.yaml`. Missing history is `UNKNOWN`, not proof of correctness.

### Activity integrity

The run must expose a heartbeat. A heartbeat is not meaningful progress. The watchdog separately evaluates:

- heartbeat freshness;
- meaningful-progress freshness;
- repeated progress with no artifact/state change;
- excessive inactivity;
- explicit blocked state.

Thresholds are configurable and recorded in the run's watchdog configuration so a later check is reproducible.

### Artifact integrity

For every required artifact derived by the PM:

- declared artifact path must remain inside the run directory;
- required artifact must exist;
- artifact status must not be `unknown`, `failed`, or `blocked`;
- `verified` artifacts must point to evidence when the contract requires evidence;
- artifact records must not claim verification before the artifact exists;
- evidence paths must resolve and remain inside the run directory unless an explicit external-evidence policy allows otherwise;
- an artifact from another run must never satisfy the current run merely because it has the same filename.

The watchdog does not infer that an artifact is required from product semantics. The PM must record applicability and required artifacts explicitly, using the authoritative contracts and artifact map.

### Evidence integrity

Evidence records must contain at minimum:

- `id`;
- `kind`;
- `status`;
- `createdAt`;
- `producer`;
- `method`;
- `result`;
- `path` or a declared external reference;
- the requirement/check being evidenced.

For required evidence, `status: passed` is necessary but not sufficient: the referenced evidence must exist and be readable, and its timestamp must be within the run's allowed freshness policy.

### Completion integrity

A run may not be treated as complete merely because `status` says `ready_for_review` or because an agent wrote `final-review.yaml`.

The watchdog checks the deterministic portion of the completion gate. The host must require a passing watchdog result before accepting a completion claim.

`ready_for_review` remains distinct from human `approved`.

## Result semantics

- `PASS`: all applicable deterministic checks pass.
- `WARN`: non-blocking observation; the run is still structurally valid.
- `BLOCKED`: the run cannot safely continue or claim readiness.
- `UNKNOWN`: the watchdog lacks required state/evidence to establish a safe result. For required checks, `UNKNOWN` is treated as blocking.

Exit codes:

- `0` PASS/WARN only;
- `2` BLOCKED or UNKNOWN;
- `3` invalid watchdog invocation/configuration;
- `4` internal watchdog error.

## Human escalation

The watchdog may identify an escalation condition, but it must not invent a product decision. The PM or human owner resolves semantic blockers.
