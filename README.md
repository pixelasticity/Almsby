# Almsby — application

Maker dashboard + public story pages + GS1 Digital Link resolver.
Next.js 16 (App Router) · TypeScript strict · Supabase (Postgres + Auth) ·
Prisma · Cloudflare R2 · Vercel.

> Phase 0 scaffold. See `guidelines/almsby-phase0-dev-brief.md` for the source
> of truth on scope, schema, and Definition of Done.

## Local development

```bash
npm install        # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env.local   # fill in real values (see checklist below)
npm run dev        # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`,
`npm run typecheck`, `npm run test`.

**Dev auth is faked.** `next dev` accepts any valid email/password and drops a
local `almsby_dev_session` cookie — no Supabase credentials needed. The auth
proxy (`proxy.ts`, Next.js 16's middleware convention) runs the same redirects
as production:
`/dashboard`, `/products`, `/settings` 307 to `/sign-in?next=…` until a
session exists, and signed-in users are bounced away from `/sign-in` and
`/sign-up`.

## Repository structure

```
app/                      # App Router — all routes live here
  (dashboard)/            # authenticated, maker-facing routes (gated by middleware)
  (public)/               # public routes — story pages + marketing + sign-in/up
  01/[gtin]/route.ts      # GS1 Digital Link resolver (DO NOT move into /api)
  api/                    # internal API routes
proxy.ts                  # Next.js 16 auth proxy — real Supabase in prod, fake sessions in dev
lib/
  env.ts                  # the ONLY module that reads process.env
  db.ts                   # lazy Prisma client
  auth/                   # Supabase auth helpers (server + client)
  gs1/                    # Digital Link URI construction, GTIN validation
prisma/schema.prisma
tests/                    # Vitest suite
```

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
   default Next.js publish output. Staging = auto-generated preview deploys per
   PR.
3. **Supabase** — create a project; note Project URL + anon key + service role
   key; enable Auth (Email/Password). These populate
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`.
4. **Supabase DB URLs** — copy the Postgres connection strings into
   `DATABASE_URL` (pooled) and `DIRECT_URL` (direct, for migrations).
5. **Cloudflare R2** — create a bucket + API token (Phase 2 uses it for
   product photos; create now, wire later).
6. **Domains** — register `Almsby.io`; decide the resolver short-domain
   (keep optional). Until then set `NEXT_PUBLIC_APP_URL` and
   `NEXT_PUBLIC_RESOLVER_URL` to the Vercel preview domain.
7. **Secrets** — load env vars into Vercel per-environment (dev/staging/prod)
   and into each developer's local `1Password` — never chat/Slack/email.
8. **DB migration** — with creds in place, run `npx prisma migrate dev` locally
   then `npx prisma migrate deploy` in staging/prod, and verify from a fresh DB.

## Guardrails (Phase 0 brief §8)

No GTIN/barcode logic beyond stubs · no story-page CMS · no billing ·
no custom resolver domain yet. If any of these creep in, stop and check in.
