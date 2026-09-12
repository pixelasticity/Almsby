# Browser Evidence Policy

## Required evidence by claim

| Claim | Minimum browser evidence |
|---|---|
| Route renders | `render` passed |
| Primary interaction works | `primary-interaction` passed |
| Accessibility structure was checked | `accessibility` passed |
| Responsive behavior was checked | applicable mobile + desktop scenarios passed |
| Error state works | `error-state` passed when applicable |
| Empty/draft state works | `empty-state` passed when applicable |
| Locale behavior works | `i18n` passed when applicable |
| Visual inspection occurred | screenshot artifact from the relevant scenario |

## Evidence quality rules

1. Evidence must belong to the current run.
2. Evidence paths must remain inside the current run directory.
3. Required scenarios must have exactly one authoritative result record; duplicates are rejected unless explicitly marked as retries with a final selected result.
4. A failed/blocked/unknown scenario cannot satisfy a required scenario.
5. A screenshot must exist and be non-empty when the scenario requires one.
6. Accessibility evidence must contain an actual snapshot or named accessibility assertion output, not merely an agent statement.
7. The browser validator must never infer success from a filename.
8. A completion claim with missing required browser evidence is `BLOCKED`.

## Minimality

The PM should select the smallest set of scenarios that fully covers the feature's risk profile. More evidence is not inherently better. Redundant browser runs should be avoided unless they address a distinct viewport, state, locale, or risk.
