# Workflow: design-feature

## Invocation

`/design-feature "<task>"`

## Phase 0 — Contract preflight

PM creates the run directory and `project.yaml` from `.ai/runs/_template/project.yaml`.

PM then:

1. reads `.ai/contracts/manifest.yaml`;
2. reads the applicable files in `guidelines/contracts/`;
3. records pinned versions/schema versions;
4. determines applicability;
5. runs the Change Impact Protocol;
6. records `contract-preflight.md` and `impact-assessment.md`;
7. validates delegation against the Agent Capability Matrix.

Do not delegate substantive work until preflight is complete.

## Phase 1 — PM planning
## Phase 0 — deterministic contract preflight

PM creates `brief.md`, identifies relevant product truth, and creates bounded specialist tasks with objective, inputs, expected artifact, acceptance criteria, tools, and escalation condition.
The runtime validates the manifest, mappings, contract presence, declared versions, and content hashes, then creates the run state and PM context bundle.

It deliberately does **not** make semantic applicability or impact decisions.


## Phase 2 — specialist discovery

Run independent work in parallel where safe:

- UX Designer → `ux-brief.md`
- Visual Designer → `visual-direction.md`
- product/constitution review → `product-review.md`

Each specialist must consume the applicable contracts for its role.

## Phase 3 — synthesis

Director consumes the specialist artifacts plus authoritative product/UX guidance and produces `design-plan.md`.

PM verifies required design artifacts before implementation.

## Phase 4 — implementation

Implementation agent reads `AGENTS.md`, the design plan, applicable contracts, and repository patterns. It implements only the approved scope.

Implementation produces `implementation-report.md`.

## Phase 5 — verification

For UI work, verify the real running application with Playwright.

Capture, as applicable:

- browser interaction evidence;
- accessibility evidence;
- screenshots;
- responsive evidence;
- i18n evidence;
- physical scan evidence;
- compliance evidence.

Do not claim verification from source inspection alone when the contract requires runtime evidence.

## Phase 6 — critique

Critic evaluates against the Review Rubric, product truth, persona, design plan, implementation evidence, and browser evidence. Produce `critique.md`.

## Phase 7 — completion gate

PM evaluates `.ai/evaluations/completion-gate.md` against `guidelines/contracts/definition-of-done.yaml`.

- failing P0/P1 or missing required evidence → bounded iteration or blocked;
- unresolved authority decision → escalate;
- all applicable gates pass → `READY_FOR_REVIEW`.

Produce `final-review.yaml`.

## Phase 8 — human review

Present:

- what changed;
- why;
- evidence;
- uncertainty and risks;
- proposed next action.

Human approval is recorded separately from agent readiness.
