# Evidence Policy

**Schema version:** 1.0

Evidence is a claim-supporting record, not a synonym for an artifact.

## Required distinction

- **Artifact**: something produced by the run.
- **Evidence**: a record of what was checked and the result.
- **Source**: the authoritative material against which a check was judged.
- **Observation**: raw output such as a screenshot, test log, accessibility snapshot, or scan result.

A screenshot may be an observation and an evidence artifact, but a screenshot alone cannot satisfy a functional or accessibility claim.

## Minimum evidence record

```yaml
id: unique-id
kind: browser | accessibility | automated-check | physical-scan | i18n | compliance | review | other
status: passed | failed | unknown | blocked
createdAt: 2026-01-01T00:00:00Z
producer: implementation | critic | watchdog | host | tool-name
method: concise description of method
result: concise observed result
requirement: requirement being evidenced
path: relative path inside current run
```

## Integrity rules

1. Evidence IDs are unique within a run.
2. A passed local evidence record must point to an existing readable file.
3. Paths cannot escape the run directory.
4. Evidence cannot be backdated before the run was created.
5. Evidence status is not inferred from filenames.
6. A report written by an agent is not sufficient evidence for the claim that the report describes.
7. Human approval is not evidence of technical verification.
8. Evidence may be superseded, but the current required evidence must be identifiable.
9. External evidence is disabled by default; enabling it requires an explicit host policy.
