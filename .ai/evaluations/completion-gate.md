# Completion Gate — Browser Enforcement

A feature that changes a browser-visible experience cannot be marked complete until the applicable browser scenarios pass.

## Gate order

1. PM declares applicable browser scenarios in run state.
2. Browser provider executes them.
3. Evidence adapter normalizes results.
4. Deterministic browser validator verifies evidence.
5. Watchdog consumes the browser validation result.
6. Only then may the completion gate consider browser verification satisfied.

## Minimum default for UI changes

Unless explicitly waived by a documented risk decision:

- `render`
- `primary-interaction` when an interaction changed
- `accessibility`
- `responsive-mobile`
- `responsive-desktop`
- relevant `error-state` / `empty-state`
- `i18n` when localized UI changed

The PM may narrow or expand this set only with an explicit applicability decision and rationale. A missing applicability decision is itself a gate failure.

## No-waiver rule

An agent cannot waive browser evidence because the page appears simple, because tests pass, or because a screenshot was reviewed manually. Waivers require the change-impact protocol and an explicit human-approved risk decision when the omitted evidence is consequential.
