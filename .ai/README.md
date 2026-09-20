# `.ai/` — Agent Operational System

`.ai/` is Almsby's execution and enforcement layer. It tells agents and host
automation **how work is run and verified**; it is not a second product
specification.

The authoritative meaning of the product remains in `/guidelines/`. The
authoritative repository-level agent behavior remains in `/AGENTS.md`.
`.ai/` operationalizes those sources and provides machinery for planning,
delegation, evidence collection, deterministic verification, watchdog
enforcement, and completion gating.

## Source-of-truth boundaries

| Question | Source |
|---|---|
| What are we building and why? | `/guidelines/` |
| What are the product decisions and domain truths? | `/guidelines/product/` |
| What are the authoritative execution contracts? | `/guidelines/contracts/` |
| What are Almsby's authoritative UX principles, patterns, visual language, and design system rules? | `/guidelines/ux/` |
| What design references and approved visual baselines may inform judgment? | `/guidelines/ux/references/` + `/guidelines/ux/baselines/` |
| How must an agent behave in this repository? | `/AGENTS.md` |
| How is a run orchestrated? | `.ai/workflows/` |
| What roles may do what? | `.ai/agents/` + authoritative capability matrix |
| How should design intelligence be operationalized? | `.ai/design/` |
| What is machine-enforced? | `.ai/config/`, `.ai/runtime/`, `.ai/watchdog/`, `.ai/browser/` |
| What evidence/review gates apply? | `.ai/evaluations/` + authoritative DoD |
| What happened during one run? | `.ai/runs/<run-id>/` |

If `.ai/` conflicts with `/AGENTS.md` or an authoritative `/guidelines/`
document, the higher-authority source wins. `.ai/` must not silently invent
product policy.

`.ai/` may translate authoritative guidance into executable procedures,
schemas, prompts, validation rules, and role instructions. Such translations
must remain traceable to their source and must not broaden the underlying
authority.

## Directory responsibilities

- `agents/` — operational role instructions for PM, director, design,
  implementation, and critique agents. These are not product personas.
- `browser/` — provider-neutral browser evidence contract, scenario catalog,
  Playwright adapter guidance, and deterministic evidence validation.
- `config/` — machine-readable execution configuration and high-risk path
  declarations.
- `contracts/` — execution-layer wiring and consumption contracts. The actual
  authoritative definitions remain in `/guidelines/contracts/`.
- `design/` — operational design-intelligence procedures: how agents consume
  visual language, references, baselines, rendered evidence, and critique.
  Authoritative design principles remain in `/guidelines/ux/`.
- `evaluations/` — deterministic completion/high-risk evaluation gates.
- `runtime/` — startup/preflight, contract pinning, PM context preparation,
  and host integration utilities.
- `runs/` — ephemeral per-run state, artifacts, evidence, and reports. Do not
  commit generated run data.
- `state/` — machine-readable run-state schema; the schema itself is versioned
  source-controlled infrastructure.
- `watchdog/` — deterministic run/state/evidence integrity enforcement.
- `workflows/` — repeatable orchestration workflows.

## Design intelligence boundary

Almsby's design-quality system has two layers.

### Authoritative design knowledge

These remain the source of truth:

- `/guidelines/ux/visual-language/` — Almsby's visual point of view.
- `/guidelines/ux/patterns/` — documented experience patterns.
- `/guidelines/ux/design-system/` — typography, color, spacing, states,
  responsive, and i18n guidance.
- `/guidelines/ux/references/` — deliberate exemplars and anti-patterns.
- `/guidelines/ux/baselines/` — canonical rendered Almsby surfaces.

These describe **what good means for Almsby**.

### Operational design intelligence

`.ai/design/` describes **how agents apply that knowledge**.

It may define how the Director establishes direction, how references are
selected, how novelty is controlled, how baselines are used, when rendered
evidence is required, and how visual/UX critique feeds another implementation
pass.

`.ai/design/` must not create an independent visual language, design system,
or product aesthetic that conflicts with `/guidelines/ux/`.

## Agent authority and role boundaries

`.ai/agents/` contains executable role guidance; it does not create new
product authority.

```text
authoritative capability matrix
        ↓
.ai/agents/*
        ↓
runtime / workflow delegation
```

The PM may coordinate work, determine applicability, delegate, track state,
and propose recovery actions within its authority.

Specialists may perform only work permitted by their role and the capability
matrix.

The Director may synthesize product, UX, visual, and implementation context
into a design direction, but may not override product decisions, hard
engineering constraints, compliance requirements, or repository guardrails.

## Core operating principle

> **Agents reason about meaning. Deterministic infrastructure verifies facts.**

Agents handle interpretation, planning, design judgment, delegation,
implementation, critique, and recovery within their authority.

Deterministic infrastructure verifies machine-observable facts: contract
integrity, state transitions, freshness, required artifacts, evidence
presence, path safety, schema validity, browser-evidence validity, and
completion-gate conditions.

A deterministic validator must not pretend to judge subjective product or
visual quality. An agent must not claim a machine-verifiable condition is
satisfied without the required evidence.

## Design-quality operating principle

For material UI work, source code alone is insufficient evidence of quality.

```text
product intent
      ↓
experience / design direction
      ↓
UX + visual design
      ↓
implementation
      ↓
real browser rendering
      ↓
visual + UX critique
      ↓
concrete design delta
      ↺
implementation / re-render
```

A visual-quality claim therefore requires rendered evidence and applicable
review, not merely an implementation diff or a statement that the UI "looks
good."

Before adding visual complexity, agents should consider whether removing,
combining, reordering, or reframing existing elements better serves the
experience.

## Enforcement chain

```text
authoritative guidelines
        ↓
contract preflight + pins
        ↓
PM semantic planning
        ↓
Director / specialist delegation
        ↓
implementation
        ↓
browser + other verification evidence
        ↓
visual / UX critique where applicable
        ↓
deterministic validators
        ↓
watchdog
        ↓
completion gate
        ↓
human approval
```

### Required invariants

**No deterministic preflight → no PM launch.**

The PM must not begin an autonomous run when the authoritative contract set
cannot be validated and pinned.

**No required evidence → no readiness claim.**

Missing, invalid, stale, contradictory, or insufficient required evidence
prevents the corresponding readiness/completion claim.

**No human approval is synthesized by agents.**

Agents may prepare recommendations for approval, but may not represent that a
human approved, reviewed, accepted, or signed off unless that action is
actually recorded.

**No rendered evidence → no visual-quality claim for material UI work.**

Where the design-quality contract requires browser evidence, source inspection
alone cannot establish visual completion.

## Evidence and claim discipline

Completion language must match the evidence available:

- **Implemented** — the requested change exists in the implementation.
- **Verified** — an applicable deterministic or procedural check established
  the stated condition.
- **Validated** — the relevant quality/evaluation process produced sufficient
  evidence for the stated claim.
- **Complete** — the applicable completion gate is satisfied.
- **Blocked** — a known condition prevents the next required step.
- **Unknown** — available evidence is insufficient to establish the claim.

A passing automated test does not automatically establish visual quality,
product usefulness, physical scan reliability, or human approval unless the
applicable contract explicitly makes that test sufficient evidence.

## Run data and repository hygiene

Generated run directories under `.ai/runs/` are execution data, not source
code. They should remain local/CI artifacts unless an audit policy requires
retention. `.ai/runs/_template/` is intentionally committed.

Do not commit Python `__pycache__`, `.pyc`, macOS metadata, browser screenshots,
or generated watchdog reports as part of the `.ai/` source package unless a
specific evidence-retention policy explicitly requires the artifact.

When evidence must be retained, associate it with a run, scenario, artifact,
provenance record, and applicable contract rather than copying it into
source-controlled infrastructure without context.

## Contract and version discipline

Authoritative contract definitions live under `/guidelines/contracts/`.
`.ai/contracts/` wires those contracts into execution.

Contract preflight must:

1. validate the required contract set;
2. validate supported schema versions;
3. establish the contract manifest and artifact mapping;
4. pin the consumed contract state;
5. fail closed when required contracts are missing, unsupported, or drifted.

A runtime or agent may consume a pinned contract snapshot, but it must not
silently substitute a different contract version.

## Failure and escalation

The system is intentionally fail-closed around claims and high-risk state.

When deterministic infrastructure reports a blocking integrity, contract,
evidence, or state failure, autonomous progression must stop until the
condition is resolved or an authorized recovery path is applied.

When an agent encounters a product, UX, visual, compliance, or architectural
decision outside its authority, it must escalate rather than silently
inventing policy.

When evidence is ambiguous, the correct state is **Unknown**, not an inferred
pass.

## Human approval boundary

Agents may prepare plans, recommend actions, explain tradeoffs, implement,
gather evidence, perform applicable reviews, identify blockers, and propose
recovery.

Agents may not:

- fabricate human approval;
- downgrade a blocking condition merely to continue;
- convert Unknown into Pass without evidence;
- override `/AGENTS.md` or authoritative `/guidelines/` policy;
- claim a subjective quality judgment was machine-proven when it was not.

## Relationship to `/AGENTS.md`

`/AGENTS.md` remains the repository-level behavioral authority for agents.

`.ai/` provides the operational machinery needed to execute that behavior
consistently. Where the two overlap, `.ai/` should implement the guardrails
rather than redefine them.

```text
/AGENTS.md
    ↓
repository behavioral constraints

/guidelines/
    ↓
product + domain + UX + quality authority

.ai/
    ↓
execution + orchestration + evidence + enforcement
```

This separation is deliberate. It keeps product truth, repository policy, and
runtime enforcement understandable and independently reviewable.
