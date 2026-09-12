# Workflow: design-feature

## Invocation

`/design-feature "<task>"`

## Host boundary — mandatory Step 12 behavior

The host/orchestrator must invoke `.ai/runtime/prepare_pm_context.py` before launching the Project Manager.

```text
prepare_pm_context
    ↓
contract_preflight PASS
    ↓
PM context + pinned state generated
    ↓
launch PM
```

If preflight exits non-zero, **the PM must not be launched**.

The PM receives `.ai/runs/<run-id>/pm-context.md` and `.ai/runs/<run-id>/project.yaml` as initial run context, then reads the authoritative sources referenced there.

## Phase 0 — deterministic contract preflight

The runtime validates the manifest, mappings, contract presence, declared versions, and content hashes, then creates the run state and PM context bundle.

It deliberately does **not** make semantic applicability or impact decisions.

## Phase 1 — PM semantic planning

The PM:

1. resolves applicability;
2. applies the Change Impact Protocol;
3. identifies authoritative product/UX/engineering sources;
4. derives required artifacts/evidence;
5. validates delegation authority;
6. records decisions in state;
7. creates bounded specialist tasks.

## Phase 2 — specialist discovery

Run independent work in parallel where safe:

- UX Designer → `ux-brief.md`
- Visual Designer → `visual-direction.md`
- product/constitution review → `product-review.md`

## Phase 3 — synthesis

Director consumes specialist artifacts plus authoritative product/UX guidance and produces `design-plan.md`.

## Phase 4 — implementation

Implementation reads `AGENTS.md`, the approved design plan, applicable contracts, and repository patterns. It implements only approved scope.

## Phase 5 — verification

For UI work, verify the real running application with Playwright and capture required evidence.

## Phase 6 — critique

Critic evaluates against the Review Rubric, product truth, persona, design plan, implementation evidence, and browser evidence.

## Phase 7 — completion gate

PM evaluates the authoritative Definition of Done plus `.ai/evaluations/completion-gate.md`.

## Phase 8 — human review

Human approval remains separate from agent readiness.

## Contract drift

Before phase transitions that depend on contract integrity, the host should run:

```text
python .ai/runtime/verify_contract_pin.py --repo-root . --run-id <run-id>
```

If a contract changed, do not silently continue. Route through the Change Impact Protocol and Contract Versioning rules.
