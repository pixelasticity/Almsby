# Workflow: add a Prisma migration

Source of truth: `guidelines/almsby-database-workflow.md`. This is that
document compressed into an executable checklist — if the two ever conflict,
the guideline doc wins.

**Gate:** `prisma/schema.prisma` and `prisma/migrations/**` are `propose-only`
per `.ai/config/high-risk-paths.yaml`. Draft the change; do not run
`prisma migrate dev` against a real database without confirmation.

## Steps

1. Confirm `supabase start` is running locally (local Postgres on `:54322`).
2. Edit `prisma/schema.prisma` with the intended change.
3. Run `npx prisma migrate dev` — this generates the migration file **and**
   applies it locally in one step. Name the migration descriptively
   (matches the existing `YYYYMMDDHHMMSS_snake_case_description` pattern).
4. Run `supabase db reset` — replays every migration from scratch. This is
   the check that catches "works on my already-set-up DB" migrations.
5. **The migration file and the code that depends on it go in the same
   commit/PR.** Never open a migration alone, and never open app code that
   assumes a schema change without the migration.
6. If the change is destructive (column drop, type change with data loss),
   confirm with the human before proceeding — do not silently accept a
   Prisma-generated `DROP COLUMN` warning.
7. Do not touch `prisma/migrations/migration_lock.toml` or any migration
   file that has already been merged to `development` or `master`.

## What this workflow does NOT cover

- Applying to staging/production — that's manual, gated, and described in
  `guidelines/almsby-database-workflow.md` §5–6. An agent should not run
  `prisma migrate deploy` against `STAGING_DATABASE_URL` or `PROD_DATABASE_URL`
  without an explicit human request and the checklist in that doc.
