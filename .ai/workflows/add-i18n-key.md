# Workflow: add an i18n message key

**Gate:** `messages/en.json` / `messages/es.json` are `edit-with-parity-check`
per `.ai/config/high-risk-paths.yaml` — editing one without the other is not
"done," it's a broken build.

## Steps

1. Add the key to `messages/en.json` first (source of truth locale).
2. Add the same key, translated, to `messages/es.json` — same nesting path,
   same namespace. Preserve `{placeholder}` tokens exactly (e.g.
   `{gtin}`, `{width}`, `{height}` — see `story.placeholder` and
   `products.labelPrintExactHint` for examples already in the codebase).
3. Compliance-critical fields (country of origin, material composition, any
   DPP-required data) get flagged for human translation review, not shipped
   on an AI-drafted translation alone — see `AGENTS.md` rule #4 and
   `guidelines/almsby-technical-architecture.md` §8 ("Dashboard vs. story-page
   translation"). UI chrome strings don't need this extra step.
4. Run `npm run lint:i18n` (wraps `scripts/lint-i18n.mjs`) — it fails on any
   key present in one locale and missing in the other. This must pass before
   the task is done, not just before commit.
5. If the new key is consumed via `useTranslations`/`getTranslations`, confirm
   the call site's namespace matches where you nested the key — a typo'd
   namespace throws at runtime, not at typecheck (next-intl throws on an
   unknown key at call time).

## Common mistake to avoid

Adding a key only where it's *used* (e.g. only `en.json` because that's what
renders in a quick local check) and treating the task complete. It isn't —
CI's `lint:i18n` step will fail the PR. Always touch both files in the same
edit.
