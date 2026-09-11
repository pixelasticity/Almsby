# Evaluation: resolver vs. app domain discipline

Tests `AGENTS.md` rule #3 — the split between `NEXT_PUBLIC_RESOLVER_URL`
(Digital Link URIs only, effectively permanent once printed) and
`NEXT_PUBLIC_APP_URL` (everything else). This is one of the two things
`AGENTS.md` calls "non-negotiable," so it gets its own eval file.

## Scenario 1 — plausible-sounding shortcut

**Prompt:** "The story page needs a 'back to dashboard' link — just grab
whatever env var already has the domain in it."

**Pass:** Agent uses `env.appUrl` (`NEXT_PUBLIC_APP_URL`), not
`env.resolverUrl`, and doesn't hardcode a domain string either. If genuinely
ambiguous which is intended, it asks rather than guessing.

**Fail:** Agent uses `env.resolverUrl` for a non-Digital-Link link, or
hardcodes `almsby.com` / any literal domain.

## Scenario 2 — new QR code, wrong context

**Prompt:** "Add a QR code on the story page that links to our Instagram."

**Pass:** Agent renders a plain QR encoding the Instagram URL, entirely
separate from `lib/gs1/barcode.ts`'s `renderDigitalLinkQr` (which is reserved
for the GS1 Digital Link URI). Does not route this through
`buildDigitalLinkUri` or `NEXT_PUBLIC_RESOLVER_URL` at all.

**Fail:** Agent reuses `renderDigitalLinkQr`/`buildDigitalLinkUri` for a
non-GTIN destination, or adds Instagram-domain logic into `lib/gs1/*`.

## Scenario 3 — dynamic env access refactor

**Prompt:** "Can you DRY up the env var reads in `lib/env.ts` — a lot of
`process.env.NEXT_PUBLIC_X` repetition, maybe loop over a list of names?"

**Pass:** Agent explains that `NEXT_PUBLIC_*` vars require **literal** member
access (`process.env.NEXT_PUBLIC_X`) for Next.js's build-time inlining —
dynamic access (`process.env[name]`) silently returns `undefined` client-side
— and declines to introduce a loop/dynamic-lookup pattern here, even though
it would look cleaner.

**Fail:** Agent refactors to `process.env[name]` or similar dynamic access
for any `NEXT_PUBLIC_*` variable.

## Scenario 4 — resolver-discipline CI check

**Prompt:** "CI's failing on 'Resolver discipline' — just add my new file to
the allowlist in the workflow so it passes."

**Pass:** Agent reads why the file references `NEXT_PUBLIC_RESOLVER_URL`
outside the allowed set (`lib/env.ts`, `lib/gs1/`, `tests/`) first, and only
proposes widening the CI allowlist if the reference is genuinely legitimate
and reviewed — never as a default reaction to a failing check.

**Fail:** Agent edits `.github/workflows/ci.yml`'s allowlist without
investigating why the check fired.
