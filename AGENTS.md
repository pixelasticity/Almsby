# AGENTS.md — Almsby

Instructions for any AI agent (planning or execution) working in this repository.
Read fully before making changes. This file encodes hard-won discipline — violating
it silently is worse than asking first.

---

## What Almsby is

GS1 compliance + Digital Product Passport SaaS. Next.js 16 (App Router), TypeScript,
Prisma + Supabase (Postgres + Auth), Cloudflare R2, bwip-js (GS1 barcode/QR
rendering), resvg (SVG rasterization), zxing-wasm (decode verification), next-intl
(i18n: en/es).

**The core promise this codebase exists to keep:** a barcode this system generates
must actually scan, correctly, on real hardware, in a real store. Every rule below
exists to protect that promise or the trust surrounding it. When in doubt, protect
the promise over the deadline.

---

## Non-negotiable rules

### 1. Never swallow an error silently
Every `catch` block must either `console.error` the original error, return a
user-safe message, or re-throw. **No empty catch blocks. No silent `return null`.
No opaque error objects passed to the user.**

This codebase already shipped and fixed one bug from this exact pattern (`{}` shown
to users on signup failure, traced to an unvalidated passthrough). Do not
reintroduce it. If you find a silent catch, flag it as a bug — don't add another one.

Exception: `lib/auth/server.ts`'s cookie-write catch is intentional (documented
Server Component constraint). Leave it.

### 2. HIGH-RISK zones — flag, don't auto-fix
These files are compliance-critical and spec-governed. Propose changes; do not
apply them without explicit confirmation:

- `lib/gs1/*` (barcode generation, Digital Link URI construction, GTIN validation/allocation)
- `app/01/[gtin]/route.ts` (the resolver — this is what real scanners hit)
- `lib/gs1/verify.ts` and the CI decode test harness (`barcode-decode.test.ts`,
  `legacy-barcode.test.ts`) — this is the barcode-correctness gate
- Any code between "render an SVG" and "confirm it decodes correctly" — this
  chain is why generated barcodes can be trusted

If a change here seems mechanical, it probably isn't. Ask first.

### 3. Domain discipline is absolute
- `NEXT_PUBLIC_RESOLVER_URL` — used ONLY to construct GS1 Digital Link URIs. This
  value is effectively permanent once a barcode is printed against it.
- `NEXT_PUBLIC_APP_URL` — used for everything else (marketing site, dashboard,
  email redirects).
- **Never** hardcode a domain string anywhere. Never use `NEXT_PUBLIC_APP_URL`
  where `NEXT_PUBLIC_RESOLVER_URL` belongs, or vice versa. A mixed-up domain in a
  demo is an annoyance; the same mistake in a real barcode generation path is a
  permanent liability.
- Resolver lookups must be domain-agnostic (look up by GTIN value, never by
  incoming host/URL) — this keeps custom-domain support possible without a rebuild.

### 4. i18n parity is enforced, not optional
- Every message key must exist in both `messages/en.json` and `messages/es.json`.
- `scripts/lint-i18n.mjs` gates this in CI — do not bypass it.
- Compliance-critical fields (country of origin, material composition) deserve
  more translation rigor than UI chrome. Don't machine-translate those without
  flagging it for human review.

### 5. Fail-closed on barcode generation
A barcode must pass automated decode verification before a user can download it.
Never let a maker download or print a barcode that hasn't been verified. If
verification logic is ever bypassed "temporarily," that's a bug, not a shortcut.

### 6. GS1 spec correctness over convenience
- GTIN check-digit validation, prefix-length flexibility (6–10 digits, real GS1
  prefixes vary — never hardcode a fixed length), sequential allocation
  (increment-only, never reuse, never derive from existing rows) are all spec
  requirements, not implementation details. Get them right even if a simpler
  version would "probably work."
- Quiet zones, minimum X-dimension, and crisp non-anti-aliased rendering are
  print-reliability requirements, not styling preferences. Don't let a UI
  convenience override a GS1 minimum.

---

## Workflow

### Plan before Act on anything non-trivial
For schema changes, anything touching a HIGH-RISK zone, or anything with more
than one reasonable approach: propose a plan, name the decision points explicitly,
wait for confirmation, then execute. Don't silently pick the "obvious" option when
there's a real tradeoff — surface it.

### Tag findings SAFE vs NEEDS-REVIEW
When reviewing code (audits, refactors, cleanup passes), tag every finding:
- **SAFE** — mechanical, low-risk, no business-logic judgment required
- **NEEDS-REVIEW** — touches business logic, a HIGH-RISK zone, or requires a
  judgment call

Execute SAFE items directly. Hold NEEDS-REVIEW items for explicit confirmation.

### Investigate flakes, don't dismiss them
A test that fails once and passes on rerun is not automatically "flaky, ignore
it." Confirm it's environmental (e.g., CPU contention, cold WASM init) by
reproducing in isolation before writing it off. Log what you found either way.

### Migrations
- Local: Supabase CLI (`supabase db reset` before every push — confirms
  migrations apply cleanly from scratch, not just on an already-set-up machine).
- Staging: manual `prisma migrate deploy`, run before opening a PR.
- Production: manual, with a human-reviewed checklist (backwards-compatible
  migration, recent backup confirmed, second-person review). Not automated by
  design — this is a deliberate gate, not a gap to close.
- Migration files and the code that depends on them ship in the same commit/PR.

### Testing conventions
- Pure logic (validators, allocators, error mappers) gets unit tests.
- Barcode generation gets a decode round-trip test (render → rasterize → decode
  → assert payload matches), run against an edge-case GTIN batch (leading zeros,
  repeated digits, invalid check digits).
- Pre-warm WASM modules once per suite (`beforeAll`), not per-test — cold-start
  cost gets charged to whichever test runs first otherwise.
- Full suite (`tsc`, `eslint`, `lint:i18n`, `vitest`, `build`) must be green
  before merge.

---

## Codebase conventions (accumulate here as they're established)

- `lib/input.ts` is the single source of truth for input normalization
  (`cleanInput`, `optionalInput`, `coerceFormString`). Don't reimplement locally.
- Shared UI primitives (`FormField`, `FormError`, `SubmitButton`) are used by
  every form. A form that reimplements its own label/error/submit handling is a
  bug, not a style choice.
- `env.ts` is client-reachable (via error boundaries) — any module-scope code
  added here must be client-safe. `NEXT_PUBLIC_*` vars must use literal member
  access (`process.env.NEXT_PUBLIC_X`), never dynamic access
  (`process.env[name]`) — Next.js only inlines the former at build time; the
  latter silently returns `undefined` client-side.
- Repeated logic (hooks, parsers, error-key mappings) belongs in a shared
  module the first time it's duplicated a second time — don't wait for a third
  copy to justify extraction.

---

## What NOT to do without asking

- Don't merge or integrate the marketing landing page into the app during early
  phases — it has its own lifecycle and gets retired at launch, not absorbed.
- Don't add scope to a phase "while you're in there." If a phase's brief says
  something is out of scope, building it anyway — even adjacent, even easy — is
  the wrong call. Flag it for a future phase instead.
- Don't close a tracking issue on "code merged" if its Definition of Done
  includes a manual/physical verification step that hasn't happened yet.
  Code-done and phase-done are different claims.
- Don't pick a technical option because it's cleverer, shorter, or more elegant
  if the boring option is more correct for what a compliance product needs
  (explicit over implicit, fail-loud over fail-silent, verified over assumed).

---

## When something in this file conflicts with a specific instruction

Ask. This file is the accumulated discipline of the project; a one-off instruction that contradicts it might be a deliberate exception — or might be a mistake worth flagging before acting on it.