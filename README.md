# Almsby — application

Maker dashboard + public story pages + GS1 Digital Link resolver.
Next.js 16 (App Router) · TypeScript strict · Supabase (Postgres + Auth) ·
Prisma · Cloudflare R2 · Vercel.

> Phase 0 scaffold. See `guidelines/almsby-phase0-dev-brief.md` for the source
> of truth on scope, schema, and Definition of Done.

## Local development

Local dev uses the **Supabase CLI** (Docker required) for a real local Postgres
and Auth (GoTrue) — no hosted credentials needed and no auth bypass. The auth
proxy (`proxy.ts`) runs the same redirect logic in every environment:
`/dashboard`, `/products`, `/settings` 307 to `/sign-in?next=…` until a session
exists, and signed-in users are bounced away from `/sign-in` and `/sign-up`.

```bash
npm install                 # installs deps + runs `prisma generate`
supabase start              # boots local Postgres (:54322) + Auth (:54321) — needs Docker
supabase status             # copy anon + service_role keys into .env.local (see .env.example)
npx prisma migrate dev      # apply migrations to the local Postgres (first run)
npm run dev                 # = `supabase start && next dev` → http://localhost:3000
```

- `npm run dev` is `supabase start && next dev`. To run Next alone (no DB), use `npx next dev`.
- `npm run db:start` / `npm run db:stop` manage the local stack.
- Other scripts: `npm run build`, `npm run start`, `npm run lint`,
  `npm run typecheck`, `npm run test`.

## Repository structure

```
app/                      # App Router — all routes live here
  (dashboard)/            # authenticated, maker-facing routes (gated by middleware)
  (public)/               # public routes — story pages + marketing + sign-in/up
  01/[gtin]/route.ts      # GS1 Digital Link resolver (DO NOT move into /api)
  api/                    # internal API routes
proxy.ts                  # Next.js 16 auth proxy — real Supabase (CLI local / hosted prod)
lib/
  env.ts                  # the ONLY module that reads process.env
  db.ts                   # lazy Prisma client
  auth/                   # Supabase auth helpers (server + client)
  gs1/                    # Digital Link URI construction, GTIN validation
prisma/
  schema.prisma           # schema is the source of truth for migrations
supabase/
  config.toml             # local Supabase CLI stack config
guidelines/                 # specs & briefs (source of truth for scope)
  phase1-dod-status.md      # live tracker for the Phase 1 DoD checkboxes
  technical-debt.md         # leveled-up debt / deferred optimizations (living log)
tests/                    # Vitest suite
.github/workflows/
  ci.yml                  # lint + typecheck + test + build (every PR)
  a11y.yml                # accessibility: jsx-a11y lint + runtime axe scan (every PR)
  release-please.yml      # versioning: maintains the Release PR (version + CHANGELOG + tag)
  deploy-migrations.yml   # migrations: push dev→staging, merge master→production
```

## Accessibility (CI + local)

Two complementary layers, both gating every PR:

1. **Static** — the `Lint` step enforces the full `eslint-plugin-jsx-a11y`
   recommended rule set (on top of Next's built-in subset).
2. **Runtime** — the dedicated `A11y` workflow builds the app with dummy env
   vars, starts it, and runs axe-core (WCAG 2.x A/AA) over every route that is
   reachable without an authenticated session (`/`, `/sign-in`, `/sign-up`,
   `/s/{gtin}`). Serious/critical violations fail the build; per-route JSON
   reports are uploaded as artifacts. The scan emulates reduced motion so
   entrance animations don't produce false contrast failures.
   Known limitation: authenticated dashboard routes are not scanned yet —
   covering them needs CI to provision a Supabase session (follow-up).

Run locally against a production server:

```bash
npm run build && npm run start   # or npx next dev
A11Y_CHANNEL=chrome npm run scan:a11y   # channel only needed on macOS < 14
```

## Versioning (Release Please)

Conventional Commits drive releases automatically. A workflow watches
`development` and maintains a single Release PR: merging it bumps
`package.json`, updates `CHANGELOG.md`, cuts a `vX.Y.Z` tag, and publishes a
GitHub Release. Semver mapping — `feat:` → minor, `fix:`/`perf:` → patch,
`BREAKING CHANGE:` footer → major; other types (`chore`, `docs`, `ci`,
`refactor`, `a11y`) don't bump the version. Caveat: the automated Release PR
shows no CI checks (a GitHub limitation for bot-created PRs); it only touches
version metadata. Tags currently mark development states — production tagging
can be added at launch.

## Internationalization (next-intl)

- Messages live in `messages/{locale}.json` — `en` is the source of truth, `es`
  is the first translated locale. Human-readable, plain JSON.
- Locale is cookie-based (`NEXT_LOCALE` cookie, `i18n/request.ts`) — no URL
  prefix, so the auth proxy (`proxy.ts`) is untouched. Default is `en`.
- To add a language: create `messages/{code}.json` mirroring `en.json`, add it
  to `locales` in `i18n/routing.ts`, and (optionally) surface it in
  `components/LocaleSwitcher.tsx`.
- Key parity across locales is enforced by `npx next-intl lint` and by the
  typed `useTranslations`/`getTranslations` keys (`tsc`) — both run in CI, so
  an AI adding a key in one language but not the other fails the pipeline.

## Migrations & deploys

Schema is owned by **Prisma** (`prisma/migrations`); the Supabase CLI only runs
the local Postgres/Auth and does not manage schema.

| Env | Database | Who migrates it |
|---|---|---|
| dev (local) | Supabase CLI Postgres | `npx prisma migrate dev` on your machine |
| staging | hosted Supabase (staging project) | GitHub Actions on push to `development` |
| production | hosted Supabase (production project) | GitHub Actions on merge to `master` |

- Staging and production are **separate Supabase projects** (correct + distinct
  env values, per the Phase 0 DoD).
- GitHub Actions applies migrations with `npx prisma migrate deploy` using
  `STAGING_DATABASE_URL`/`STAGING_DIRECT_URL` and `PROD_DATABASE_URL`/
  `PROD_DIRECT_URL` secrets (see `.github/workflows/deploy-migrations.yml`).
- **Vercel:** the Production Branch is **`master`** — only merges to `master`
  deploy to production; `development` deploys to the Preview env. The migration
  job and the Vercel deploy run concurrently (accepted for Phase 0's stable
  schema; can be made strictly ordered later).

## Resolver discipline (non-negotiable)

GS1 Digital Link URIs are constructed in exactly one place —
`lib/gs1/digital-link.ts` — which reads **`NEXT_PUBLIC_RESOLVER_URL` only**.
Never use `NEXT_PUBLIC_APP_URL` or a hardcoded domain. CI enforces this with a
grep check in `.github/workflows/ci.yml`.

## Phase 0 Definition of Done (track status)

- [ ] Sign up → log in → create a **Business** record, in **deployed staging**
- [ ] Create an empty **Product** under that Business
- [ ] All three route groups render `(dashboard)`, `(public)`, `/01/[gtin]`
- [ ] `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_RESOLVER_URL`
      correct + distinct across dev/staging/prod
- [ ] No code path builds a Digital Link URI from `NEXT_PUBLIC_APP_URL`
- [ ] Prisma migrations run cleanly from a fresh database

Current status: `typecheck` / `lint` / `test` (3/3) / `build` all green on
Next.js 16.3.0. **Caveat:** this machine's CA store doesn't trust
`binaries.prisma.sh`, so `prisma generate`/`validate` leave a stub client
until run in a normal network environment (a local shell with proper certs, or
GitHub Actions CI) — run `npx prisma generate` there once before Phase 1.
The infrastructure-dependent DoD items below are blocked on founder
provisioning.

## Founder checklist (do these to finish Phase 0)

1. **GitHub** — create a private repo for this project; add the developer.
2. **Vercel** — create a project connected to the repo. **Root Directory: `/`**
   (the Next app now lives at the repo root), build command `npm run build`,
   default Next.js publish output, and **Production Branch strictly `master`**
   (deploys to prod only on merges to `master`). Staging = Preview deploys of
   the `development` branch.
3. **Supabase** — create **two** projects (staging + production). For each, note
   Project URL + anon key + service-role key; enable Auth (Email/Password).
   These populate `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   (distinct per environment).
4. **Supabase DB URLs** — for staging and production, copy the Postgres strings
   into `DATABASE_URL` (pooled) and `DIRECT_URL` (direct, for migrations);
   these become the `STAGING_*` / `PROD_*` GitHub Actions secrets.
5. **Cloudflare R2** — create a bucket + API token (Phase 2 uses it for
   product photos; create now, wire later).
6. **Domains** — register `Almsby.io`; decide the resolver short-domain
   (keep optional). Until then set `NEXT_PUBLIC_APP_URL` and
   `NEXT_PUBLIC_RESOLVER_URL` to the Vercel preview domain.
7. **Secrets** — load env vars into Vercel per-environment (dev/staging/prod)
   and into each developer's local `1Password` — never chat/Slack/email.
8. **DB migration** — run `npx prisma migrate dev` locally (against
   `supabase start`); staging/production migrations run automatically from CI
   (`deploy-migrations.yml`) on push to `development` / merge to `master`.
   Verify migrations apply from a fresh DB.
9. **Local tooling** — install **Docker** (Desktop) and
   `brew install supabase/tap/supabase` (required for `supabase start`).

## Guardrails (Phase 0 brief §8)

No GTIN/barcode logic beyond stubs · no story-page CMS · no billing ·
no custom resolver domain yet. If any of these creep in, stop and check in.
