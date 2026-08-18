import { readFileSync } from "node:fs";

// Deterministic key-parity check for next-intl message catalogs.
// Fails if any locale is missing a key that `en.json` (source of truth) has,
// or has an extra key. Runs in CI via `npm run lint:i18n`.

const LOCALES = ["en", "es"];

function flatten(prefix, obj, out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object") flatten(key, v, out);
    else out.push(key);
  }
  return out;
}

const catalogs = Object.fromEntries(
  LOCALES.map((loc) => [
    loc,
    new Set(flatten("", JSON.parse(readFileSync(`messages/${loc}.json`, "utf8")))),
  ])
);

const source = catalogs.en;
let bad = false;
for (const [loc, keys] of Object.entries(catalogs)) {
  if (loc === "en") continue;
  const missing = [...source].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !source.has(k));
  if (missing.length || extra.length) {
    bad = true;
    console.error(`[i18n] ${loc}.json out of sync:`);
    if (missing.length) console.error(`  missing: ${missing.join(", ")}`);
    if (extra.length) console.error(`  extra:   ${extra.join(", ")}`);
  }
}
if (bad) process.exit(1);
console.log(`[i18n] OK — ${source.size} keys, all locales in sync`);