# Almsby Playwright Integration

**Status:** active

The repository already has Playwright and `@axe-core/playwright`, plus the
`npm run scan:a11y` command. Step 14 extends that infrastructure; it does not
replace it.

## Existing repository gate

`npm run scan:a11y` runs `scripts/a11y-scan.mjs` against a production server
and writes route-level axe output to `a11y-report/`. Serious and critical axe
violations fail that scan.

That existing CI/local report is useful verification evidence, but it is not
automatically a Step 14 run artifact because it lives outside
`.ai/runs/<run-id>/`.

## Step 14 integration

For an AI run, the browser host should:

1. start/target the real application using the repository's normal workflow;
2. execute the PM-selected browser scenarios with Playwright;
3. normalize each scenario into `.ai/browser/schemas/browser-evidence.schema.json`;
4. copy or emit the resulting observations under
   `.ai/runs/<run-id>/evidence/browser/`;
5. reference screenshots/snapshots/logs from that same run;
6. run `.ai/browser/validate_browser_evidence.py`;
7. record the resulting report in `project.yaml.browserVerification`;
8. let the watchdog consume that report before readiness.

The existing `npm run scan:a11y` remains a separate repository-level CI gate.
For an AI run, its output may be incorporated as evidence only when the output
is copied into the current run with clear provenance and the browser evidence
contract is satisfied.

## Do not duplicate accessibility logic

Do not create a second axe configuration merely to satisfy Step 14. Reuse the
repository's established WCAG 2.0/2.1 A/AA scan where it covers the claim, and
add scenario-specific Playwright assertions for the feature-specific behavior
the global scan cannot establish.

## Repository-specific routes

Browser scenarios must use routes that exist in the current application and
must not invent a route solely to satisfy the catalog. Authenticated routes
require an explicitly provisioned test session; the browser evidence contract
does not permit pretending an inaccessible route passed.
