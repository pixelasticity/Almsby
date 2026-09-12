# Watchdog Host Integration

**Schema version:** 1.0

The host/orchestrator owns enforcement. The watchdog only observes and reports.

## Required lifecycle

```text
run created
   ↓
watchdog init
   ↓
PM updates explicit applicability + state timestamps
   ↓
host records heartbeat / meaningful progress
   ↓
watchdog check
   ↓
PASS/WARN → continue
BLOCKED/UNKNOWN → stop current phase → recovery/escalation
   ↓
completion claim
   ↓
watchdog check MUST PASS
   ↓
human review / approval
```

## Heartbeats

The host should update `lastHeartbeatAt` in `project.yaml` when the orchestrator has observed actual agent activity, then record a watchdog heartbeat event.

Meaningful progress is stronger than activity. The host should update `lastMeaningfulProgressAt` only when a material state/artifact change occurred, such as a new approved artifact, implementation change, verification result, or recorded decision.

Do not update a progress timestamp merely because an agent produced prose saying it made progress.

## Phase enforcement

Before launching work in a new phase:

1. verify the contract pin;
2. run the watchdog;
3. require the prior phase's required artifacts/evidence to be valid;
4. reject illegal observed state transitions.

## Completion enforcement

The host must refuse to treat `ready_for_review` or `approved` as trustworthy unless the watchdog returns exit code `0` and the completion gate itself passes.

A watchdog `WARN` is non-blocking by design, but warnings must remain visible in the report.

## Recovery

On exit code `2`:

- stop the current autonomous phase;
- preserve all run artifacts;
- record the watchdog result;
- move to `recovering` only through the normal run-state mechanism;
- let the PM determine the smallest corrective action;
- re-run the watchdog after correction.

The watchdog never edits `project.yaml` to force recovery or completion.


## Browser gate integration

Before the watchdog can return a completion-ready result for a UI change, the host must run `.ai/browser/validate_browser_evidence.py` against the current run using the PM-declared required scenario IDs. The watchdog consumes the resulting report; it does not infer browser success from agent messages.
