# Browser Consumption Contract

**Schema version:** 1.1
**Status:** active

## Purpose

Define the deterministic interface between browser evidence production, browser
validation, run state, and the completion gate.

## Inputs

- current `.ai/runs/<run-id>/` directory;
- PM-declared `browserVerification.requiredScenarios`;
- normalized browser evidence records under `evidence/browser/`;
- `.ai/browser/scenarios.yaml`;
- `.ai/browser/config.yaml`.

## Validator output

`browser-validation-report.json` contains:

- `schema_version`;
- `run_id`;
- `status` (`PASS`, `WARN`, or `BLOCKED`);
- `required_scenarios`;
- per-scenario results;
- errors/warnings.

A validator exit code of `0` means `PASS`. Exit code `2` means the evidence
cannot satisfy the browser gate.

## State consumption

The host records the validator result in:

```yaml
browserVerification:
  requiredScenarios: [...]
  status: passed | blocked | unknown | not_required
  lastValidationReport: browser-validation-report.json
```

The watchdog consumes that report and verifies that:

1. the report belongs to the current run;
2. the report path is inside the current run;
3. the report says `PASS`;
4. the reported required scenario set matches PM state;
5. PM state says browser verification is `passed`.

The watchdog does not infer browser success from screenshots, filenames, agent
messages, or Playwright logs.

## Multiple attempts

A scenario may have multiple evidence records only when exactly one is marked
`selected: true` as the final result. Without an unambiguous selected result,
the required scenario is not satisfied.

## Separation

The browser system verifies machine-observable browser claims. It does not
judge aesthetics, UX quality, product alignment, or accessibility quality
beyond the assertions explicitly represented in the evidence.
