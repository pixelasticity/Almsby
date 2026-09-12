# Almsby Deterministic Watchdog

Step 13 adds deterministic run-integrity and evidence-integrity enforcement to the AI operating system.

## Core invariant

> No valid state/evidence → no valid claim of progress or completion.

The watchdog is intentionally not an LLM. It checks machine-observable facts and returns a deterministic result that the host must enforce.

## What it owns

- state/schema integrity;
- legal status transitions;
- heartbeat freshness;
- meaningful-progress freshness;
- artifact existence/status/path integrity;
- evidence record structure and referenced-file integrity;
- contract-pin integrity;
- deterministic completion prerequisites;
- reproducible watchdog reports.

## What it does not own

- UX quality;
- visual quality;
- product strategy;
- semantic interpretation of user needs;
- deciding whether a design is beautiful;
- resolving ambiguous product decisions;
- replacing the PM, Critic, Director, or human approval.

## Runtime files

For each run, the watchdog writes:

- `watchdog.yaml` — human-readable result;
- `watchdog.json` — machine-readable result;
- `watchdog-events.jsonl` — append-only heartbeat/progress/event ledger;
- `watchdog-config.yaml` — immutable run-local thresholds copied from runtime configuration.

## Commands

```text
python .ai/watchdog/watchdog.py init --repo-root . --run-id <id>
python .ai/watchdog/watchdog.py heartbeat --repo-root . --run-id <id> --agent <role>
python .ai/watchdog/watchdog.py progress --repo-root . --run-id <id> --agent <role> --reason "..."
python .ai/watchdog/watchdog.py check --repo-root . --run-id <id>
```

The checker is read-only with respect to product/run state. It writes only watchdog-owned files.

## Enforcement boundary

The host/orchestrator must treat exit code `2` as a hard stop for the current phase and route the run to recovery/escalation. A watchdog report must never be edited to make a failed check pass.
