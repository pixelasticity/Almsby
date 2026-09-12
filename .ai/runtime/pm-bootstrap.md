# PM Bootstrap Protocol

This is the deterministic boundary between the host/orchestrator and the Project Manager.

## Purpose

The PM must not begin substantive planning from memory, a stale prompt, or an unpinned summary. The host launches deterministic preflight first, then supplies the generated PM context bundle.

## Required launch sequence

1. Generate a unique run ID.
2. Run:

```text
python .ai/runtime/contract_preflight.py --repo-root . --run-id <run-id> --task "<task>" --objective "<objective>"
```

3. If the command exits non-zero, **do not launch the PM**. Report `BLOCKED` with the reason.
4. Supply `.ai/runs/<run-id>/pm-context.md` and `.ai/runs/<run-id>/project.yaml` as initial PM context.
5. The PM then reads the authoritative contract files named by the context bundle and the applicable product/engineering/UX sources.
6. Before every phase transition after planning, run:

```text
python .ai/runtime/verify_contract_pin.py --repo-root . --run-id <run-id>
```

7. If verification fails, pause the PM and require re-preflight/change-impact handling.

## Host integration rule

The model host may differ (Qwen Code, another local agent runner, or a future orchestrator). The host adapter is responsible for passing the generated context into the PM's initial context. `.ai/` deliberately does not hard-code a model vendor or CLI syntax.

## Why this is automatic

The contract loader and pin verifier are deterministic. The PM cannot accidentally skip the contract-loading stage if the host follows this bootstrap boundary, because a failed preflight prevents PM launch.

The PM still makes semantic decisions—applicability, impact, delegation, prioritization, escalation. Automation establishes the inputs and prevents stale/missing contract state from being silently accepted.
