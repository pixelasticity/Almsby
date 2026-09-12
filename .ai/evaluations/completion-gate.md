# Completion Gate

## Authority

The authoritative Definition of Done is `guidelines/contracts/definition-of-done.yaml`.
This file defines how the `.ai` execution layer evaluates and records that contract. It does not replace it.

## Gate inputs

The PM must have access to:

- current `project.yaml`;
- contract preflight record;
- impact assessment;
- applicable design artifacts;
- implementation report, when code was changed;
- automated check results;
- browser evidence for UI work;
- accessibility evidence for UI work;
- applicable responsive, i18n, physical-scan, and compliance evidence;
- critic review;
- final review.

## Fail-closed rules

The gate is `FAIL` when any applicable required condition is:

- missing;
- `unknown`;
- failed;
- blocked;
- contradicted by repository evidence;
- claimed only by an agent without supporting evidence.

`NOT_APPLICABLE` is valid only when applicability is explicitly established and recorded with rationale.

## Evidence requirements

Evidence must identify:

- what was checked;
- how it was checked;
- when it was checked;
- the result;
- the artifact/location containing evidence;
- the agent or tool that performed the check.

For browser verification, evidence should identify the route, viewport/device context where relevant, interaction path, and observed result.

For visual claims, screenshots are evidence. For functional claims, interaction/test results are required. For accessibility claims, an accessibility-oriented check is required. Do not collapse these into a single screenshot.

## PM decision

The PM may set `ready_for_review` only if every applicable completion gate passes and all unresolved uncertainty is recorded.

Otherwise:

- `iterate` for bounded correctable work;
- `blocked` for unresolved dependency or missing required evidence;
- `escalate` for decisions outside agent authority.

## Human gate

`ready_for_review` is not approval. Human approval must be represented separately in state and may not be synthesized by an agent.
