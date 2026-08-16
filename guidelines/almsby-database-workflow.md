# Almsby — Database Workflow & Migration Guide
*How we manage schema changes across local, staging, and production environments.*

---

## 1. The three-environment model

Every environment has its own isolated Supabase project. Never point local development or staging at the production database.

| Environment | Supabase Project | Triggered by | Purpose |
|---|---|---|---|
| Local | `almsby-dev` | Developer's machine | Daily development, schema experimentation |
| Staging (preview) | `almsby-staging` | Merge to `development` branch | Integration testing, DoD verification |
| Production | `almsby-prod` | Merge to `master` | Real customer data — treat as sacred |

---

## 2. Prerequisites

**Docker** is required to run the Supabase CLI locally. Install it before anything else.

- Mac: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

Verify Docker is running before proceeding:
```bash
docker --version
docker ps
```

**Supabase CLI** — install via Homebrew (Mac/Linux) or scoop (Windows):
```bash
# Mac/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Verify:
```bash
supabase --version
```

---

## 3. Initial local setup (first time only)

**Step 1: Link the CLI to the dev Supabase project**
```bash
supabase login
supabase link --project-ref <almsby-dev-project-ref>
```
The project ref is found in the Supabase dashboard URL: `https://app.supabase.com/project/<ref>`.

**Step 2: Start the local Supabase stack**
```bash
supabase start
```
This pulls and starts Docker containers for Postgres, Auth, Storage, and the Supabase Studio UI. First run takes a few minutes; subsequent starts are fast.

You'll get output like:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
```

Use the `DB URL` as your local `DATABASE_URL` in `.env.local`.

**Step 3: Apply existing migrations**
```bash
supabase db reset
```
This wipes the local database and replays all migrations from scratch — confirming the full migration history applies cleanly. Run this whenever you pull new changes that include migrations.

---

## 4. Daily development workflow

```
1. supabase start          # if not already running
2. Make schema changes via Prisma schema edits
3. npx prisma migrate dev  # generates a new migration file + applies locally
4. Test the change works
5. supabase db reset       # verify migrations replay cleanly from scratch
6. Commit the migration file alongside the code change that needs it
```

**Critical rule: migration files and the code that depends on them always go in the same commit/PR.** A migration that reaches staging without the code that uses it (or vice versa) will break things in ways that are annoying to debug.

---

## 5. Applying migrations to staging

For now, migrations are applied to staging manually before merging to `development`. This is intentional — at the current team size, manual deployment is lower overhead than maintaining GitHub Actions automation, and it keeps the process visible and auditable.

```bash
# Set the staging DB URL (get from Supabase dashboard for almsby-staging)
export STAGING_DB_URL="postgresql://postgres:<password>@<host>:5432/postgres"

# Apply pending migrations to staging
npx prisma migrate deploy --url $STAGING_DB_URL
```

Run this as part of the PR process — migrations go to staging, you verify the branch works in the staging environment, then open the PR to `development`.

**Before applying any migration to staging:**
- Run `supabase db reset` locally first — confirms the migration applies cleanly from scratch
- Review the migration SQL file directly — make sure it's doing what you expect, no accidental destructive operations

---

## 6. Applying migrations to production

Production migrations are a deliberate, manual step run at release time — not automated. This is intentional: production data is real customer data and deserves explicit human sign-off before schema changes touch it.

**Checklist before running production migrations:**
- [ ] Migration has been running in staging without issues for at least one full staging test cycle
- [ ] Migration is backwards-compatible — if the deploy fails halfway, the old code still works against the new schema
- [ ] A Supabase backup has been triggered manually in the dashboard (Settings → Database → Backups) within the last hour
- [ ] Someone besides the person running the migration has reviewed the SQL

```bash
# Set the production DB URL (treat this like a production secret — never commit it)
export PROD_DB_URL="postgresql://postgres:<password>@<host>:5432/postgres"

# Apply pending migrations to production
npx prisma migrate deploy --url $PROD_DB_URL
```

---

## 7. When to automate (future)

The manual staging migration process above is appropriate until either:
- A second developer joins and coordination becomes the bottleneck
- Migration frequency increases to the point manual steps are consistently being forgotten

At that point, add a GitHub Actions workflow that runs `prisma migrate deploy` against staging on push to the `development` branch. The workflow will need:
- `STAGING_DATABASE_URL` stored as a GitHub Actions secret
- A workflow file at `.github/workflows/migrate-staging.yml`
- Notification on failure (Slack or email)

Production migration automation is deliberately not recommended — the manual checklist above provides a safety gate that automation would remove.

---

## 8. Useful commands reference

```bash
supabase start              # start local stack
supabase stop               # stop local stack
supabase db reset           # wipe local DB and replay all migrations from scratch
supabase status             # show local stack URLs and status
supabase migration list     # list all migrations and their status

npx prisma migrate dev      # create and apply a new migration locally
npx prisma migrate deploy   # apply pending migrations to a target DB (staging/prod)
npx prisma migrate status   # show which migrations are pending
npx prisma studio           # open Prisma's visual DB browser (useful for local inspection)
```

---

## 9. Environment variables for database connections

Each environment's `DATABASE_URL` should be stored in the appropriate place — never committed to the repo:

| Environment | Where it lives |
|---|---|
| Local | `.env.local` (gitignored) |
| Staging | Vercel environment variables, scoped to Preview |
| Production | Vercel environment variables, scoped to Production |
| GitHub Actions (future) | GitHub Actions secrets |

The production `DATABASE_URL` should only ever be known to the founder and the lead developer — treat it like a password to the most sensitive system you own, because it is.
