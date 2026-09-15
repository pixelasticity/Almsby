# `.ai/` — agent-operational system

`.ai/` is Almsby's execution and enforcement layer. It tells agents and host
automation **how work is run and verified**; it is not a second product
specification.

## Source-of-truth boundaries

| Question | Source |
|---|---|
| What are we building and why? | `/guidelines/` |
| What are the product decisions and domain truths? | `/guidelines/product/` |
| What are the authoritative execution contracts? | `/guidelines/contracts/` |
| How must an agent behave in this repository? | `/AGENTS.md` |
| How is a run orchestrated? | `.ai/workflows/` |
| What roles may do what? | `.ai/agents/` + authoritative capability matrix |
| What is machine-enforced? | `.ai/config/`, `.ai/runtime/`, `.ai/watchdog/`, `.ai/browser/` |
| What evidence/review gates apply? | `.ai/evaluations/` + authoritative DoD |
| What happened during one run? | `.ai/runs/<run-id>/` |

If `.ai/` conflicts with `/AGENTS.md` or an authoritative `/guidelines/`
document, the higher-authority source wins. `.ai/` must not silently invent
product policy.

## Directory responsibilities

- `agents/` — role instructions for the PM, design, implementation, and
  critique agents. These are operational role boundaries, not product personas.
- `browser/` — provider-neutral browser evidence contract, scenario catalog,
  Playwright adapter guidance, and deterministic evidence validation.
- `config/` — machine-readable execution configuration and high-risk path
  declarations.
- `contracts/` — execution-layer wiring and consumption contracts. The actual
  authoritative contract definitions remain in `/guidelines/contracts/`.
- `evaluations/` — deterministic completion/high-risk evaluation gates.
- `runtime/` — startup/preflight and host integration utilities.
- `runs/` — ephemeral per-run state, artifacts, evidence, and reports. Do not
  commit generated run data.
- `state/` — machine-readable schema for run state; the schema itself is
  versioned source-controlled infrastructure.
- `watchdog/` — deterministic run/state/evidence integrity enforcement.
- `workflows/` — repeatable orchestration workflows.

## Core operating principle

> **Agents reason about meaning. Deterministic infrastructure verifies facts.**

The PM may decide applicability, impact, delegation, and recovery actions.
The watchdog and browser validators verify only claims that can be established
from machine-observable state/evidence.

## Run data and repository hygiene

Generated run directories under `.ai/runs/` are execution data, not source
code. They should remain local/CI artifacts unless a specific audit policy
requires retention. `.ai/runs/_template/` is intentionally committed.

Do not commit Python `__pycache__`, `.pyc`, macOS metadata, browser screenshots,
or generated watchdog reports as part of the `.ai/` source package.

## Enforcement chain

```text
authoritative guidelines
        ↓
contract preflight + pins
        ↓
PM semantic planning
        ↓
specialist work / implementation
        ↓
browser + other verification evidence
        ↓
deterministic validators
        ↓
watchdog
        ↓
completion gate
        ↓
human approval
```

No deterministic preflight → no PM launch.
No required evidence → no readiness claim.
No human approval is synthesized by agents.
