# Evidence

This directory defines the shape and expectations of quality evidence. It is intentionally separate from live run evidence.

## Permanent vs transient

Permanent:

- protocols;
- acceptance principles;
- evidence requirements;
- reusable templates.

Transient:

- screenshots from a specific run;
- test output from a specific commit;
- physical scan logs;
- one-off review findings;
- run status.

Transient evidence belongs under `.ai/runs/<run-id>/`.

## Minimum evidence record

```yaml
dimension: accessibility
status: passed | failed | blocked | skipped | unknown
check: "What was checked"
method: "How it was checked"
environment: "Relevant browser/device/locale/etc."
artifact: "Path or identifier for retained evidence"
reviewer: "Agent or human"
timestamp: "ISO-8601"
notes: "Important findings or limitations"
```

## Status semantics

- `passed` — evidence supports the criterion.
- `failed` — criterion was tested and did not pass.
- `blocked` — criterion could not be tested because of a dependency.
- `skipped` — intentionally not applicable; explain why.
- `unknown` — insufficient evidence.

`unknown` must never silently become `passed`.

## Evidence integrity

Evidence should identify the version/run it belongs to where practical.

Screenshots without route/state/viewport are weak evidence.

Test output without command/environment is weak evidence.

A reviewer statement without describing what was reviewed is weak evidence.

Evidence is strongest when another person can understand what happened without reconstructing the entire run.
