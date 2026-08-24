/**
 * Runtime accessibility scan (axe-core + Playwright) — CI gate for the
 * dedicated `A11y` workflow and runnable locally via `npm run scan:a11y`.
 *
 * Scans every route reachable without an authenticated session or database,
 * using WCAG 2.0/2.1 A+AA rules. Fails (exit 1) when any serious or critical
 * violation is found; moderate/minor violations are logged for triage.
 * Full per-route axe results are written to a11y-report/ as JSON.
 *
 * Prerequisites: a production server on :3000 (`npm run build && npm run start`).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE_URL = process.env.A11Y_BASE_URL ?? "http://localhost:3000";
const REPORT_DIR = "a11y-report";

// CI uses the bundled Chromium. Locally on older macOS (where Playwright
// won't download browsers) run with: A11Y_CHANNEL=chrome npm run scan:a11y
const CHANNEL = process.env.A11Y_CHANNEL || undefined;

// Add routes here once CI provisions an authenticated session for them.
const ROUTES = ["/", "/sign-in", "/sign-up", "/s/00012345678905"];

// Violations at this impact level fail the scan.
const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

mkdirSync(REPORT_DIR, { recursive: true });

const browser = await chromium.launch({ channel: CHANNEL });
let failed = false;

try {
  // AxeBuilder needs a page from an explicit context (browser.newPage() is
  // not supported by @axe-core/playwright).
  const context = await browser.newContext();
  const page = await context.newPage();

  // Analyze the settled UI, not entrance animations sampled at partial
  // opacity. Emulating reduced motion makes our global reduce-motion CSS
  // complete all animations instantly — and exercises that code path too.
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const route of ROUTES) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "load" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const file = `${REPORT_DIR}/${route === "/" ? "root" : route.replaceAll("/", "_")}.json`;
    writeFileSync(file, `${JSON.stringify(results, null, 2)}\n`);

    const blocking = results.violations.filter((v) =>
      BLOCKING_IMPACTS.has(v.impact)
    );

    console.log(`\n=== ${route} — ${results.violations.length} violation type(s) ===`);
    for (const v of results.violations) {
      const tag = BLOCKING_IMPACTS.has(v.impact) ? "BLOCKING" : "warning ";
      console.log(
        `[${tag}] ${v.impact} ${v.id}: ${v.help} (${v.nodes.length} node(s))`
      );
    }
    if (blocking.length > 0) failed = true;
  }
} finally {
  await browser.close();
}

if (failed) {
  console.error("\na11y scan FAILED — serious/critical violations found.");
  process.exit(1);
}
console.log("\na11y scan passed — no serious/critical violations.");
