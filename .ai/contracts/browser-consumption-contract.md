# Browser Consumption Contract

**Schema version:** 1.0

The browser validator is the deterministic consumer interface between browser evidence and the watchdog/completion gate.

## Inputs

- run directory
- PM-declared required scenario IDs
- normalized browser evidence records

## Output

`browser-validation-report.json` with `PASS`, `WARN`, or `BLOCKED`.

## Host rule

A non-zero validator exit code MUST prevent the host from treating browser verification as satisfied. The host must not reinterpret or downgrade the result.

## Separation

The validator checks structural truth only. It does not judge aesthetics, UX quality, accessibility conformance beyond the declared machine-verifiable assertions, or product alignment.
