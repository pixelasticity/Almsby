# Watchdog Gate

## Purpose

This is the execution-layer gate for deterministic integrity checks. The authoritative Definition of Done remains `guidelines/contracts/definition-of-done.yaml`.

## Required result

A run may advance or claim readiness only when:

1. contract pins are valid;
2. state integrity passes;
3. observed status/phase transition is legal;
4. required heartbeat/progress checks are not stale;
5. required artifacts exist and have acceptable statuses;
6. required evidence records are structurally valid and resolvable;
7. completion-specific artifacts are present when readiness/approval is claimed.

`UNKNOWN` is blocking whenever the missing information is required to establish safety.

## Separation of concerns

The watchdog verifies deterministic preconditions. The PM and Critic still perform semantic/product evaluation. The human still owns final approval.

## Forbidden shortcuts

- changing a watchdog report by hand;
- converting `UNKNOWN` to `PASS` through prose;
- using a screenshot as proof of every quality dimension;
- using an agent's completion statement as evidence;
- treating `ready_for_review` as human approval;
- copying artifacts from another run into the current run without a recorded provenance path.
