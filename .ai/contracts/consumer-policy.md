# Contract Consumer Policy

## Purpose

This policy connects the formal contracts in `guidelines/contracts/` to the agent operating system without creating a second source of truth.

## Preflight sequence

Before a run is delegated:

1. Identify the task objective and requested outcome.
2. Load the contract manifest.
3. Read the applicable contract files from `guidelines/contracts/`.
4. Record the exact contract versions/schema versions in `project.yaml`.
5. Classify the change using the Change Impact Protocol.
6. Derive the required artifacts, reviews, and evidence from the Design Brief and Definition of Done.
7. Confirm every delegated role is permitted by the Agent Capability Matrix.
8. If any required contract is missing, malformed, unsupported, or ambiguous, set the run to `blocked` and escalate.

## Agent consumption rule

An agent should receive the smallest relevant subset of product truth and contracts needed for its task, but it must never receive a lower-level summary in place of a required authoritative contract.

Summaries may improve context efficiency; they do not override source files.

## Contract-to-artifact mapping

The PM uses `.ai/contracts/artifact-map.yaml` to translate contract requirements into run artifacts. The map is a workflow aid, not a replacement for the contracts.

## Version rule

A run is pinned to the contract versions recorded at preflight. If a contract changes during the run:

- do not silently continue;
- determine whether the change affects the current work;
- follow `guidelines/contracts/change-impact-protocol.md` and `guidelines/contracts/contract-versioning.md`;
- re-preflight when required.

## Completion rule

The PM must evaluate completion using the authoritative Definition of Done and `.ai/evaluations/completion-gate.md`. No agent may self-certify completion merely by producing a report.
