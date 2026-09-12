# PM Contract Consumption Interface

**Contract ID:** `pm-consumption-interface`
**Version:** `1.0`

## Purpose

Define the exact boundary between deterministic preflight and the Project Manager agent.

The goal is not to make the PM blindly execute a script. The goal is to make it impossible for a healthy run to begin PM planning without a validated, pinned contract context.

## Producer

`.ai/runtime/prepare_pm_context.py` produces:

- `project.yaml` — initial persisted run state;
- `contract-preflight.md` — validation record;
- `pm-context.md` — PM-facing startup index;
- `pm-context.json` — machine-readable pins and metadata;
- `pm-contract-bundle.md` — generated snapshot containing the actual contract text.

## Consumer

The Project Manager consumes those artifacts plus the authoritative files under `guidelines/`.

## Preconditions

The PM may begin substantive planning only if:

- preflight result is `PASS`;
- every required contract exists;
- every contract version field is present;
- manifest mappings match the expected authoritative paths;
- contract content hashes are pinned;
- `project.yaml` exists for the run;
- the generated contract bundle exists.

## Consumption order

The PM should process startup context in this order:

1. `pm-context.md` — understand the run and pins;
2. `pm-contract-bundle.md` — load the contract text without requiring ad-hoc discovery;
3. authoritative files in `guidelines/contracts/` — confirm source truth when needed;
4. product/UX/engineering source material applicable to the task.

## PM responsibilities after bootstrap

The PM must still:

1. resolve applicability;
2. classify impact;
3. identify source-of-truth documents;
4. derive required artifacts/evidence;
5. validate delegation authority;
6. record decisions and escalation;
7. maintain state throughout execution;
8. evaluate completion against the authoritative Definition of Done.

These are semantic responsibilities and must not be replaced by regex or heuristic automation.

## Fail-closed behavior

If bootstrap is missing, malformed, stale, or contradicted by repository state, the run is `blocked` until the condition is resolved.

The PM must never:

- substitute a remembered contract;
- treat missing contracts as optional;
- treat `unknown` applicability as `not_applicable`;
- rewrite contract meaning inside a prompt;
- certify its own completion without evidence.
