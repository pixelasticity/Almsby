# Almsby — Phase 0 Developer Brief
*Everything needed to set up the foundation correctly, once, so nothing has to be redone later.*

---

## 1. Context (read this first)

Almsby has three surfaces that all read/write the same data: an authenticated maker dashboard, public story pages, and a GS1 Digital Link resolver endpoint that physical barcodes will point to once printed. Phase 0 is the scaffolding all three sit on. Get the structure right now — the resolver endpoint in particular becomes hard to change once real customers have printed barcodes against it.

**Full technical context lives in the architecture doc** — this brief is the actionable subset for actually starting the build.

---

## 2. Tech decisions — locked in, do not relitigate

| Decision | Choice |
|---|---|
| Framework | Next.js 16, App Router |
| Language | TypeScript (strict mode on) |
| Database | PostgreSQL, hosted on Supabase |
| ORM | Prisma |
| Auth | Supabase Auth |
| File/image storage | Cloudflare R2 (not Supabase Storage — see architecture doc for why) |
| Hosting | Vercel |

If any of these seem wrong once you're in the code, flag it — don't silently swap one out. The dashboard/story-page/resolver split assumes Next.js's routing model specifically.

---

## 3. Repo structure

```
/app
  /(dashboard)/          # authenticated routes — maker-facing
    /dashboard/
    /products/
    /settings/
  /(public)/             # public routes — no auth
    /s/[gtin]/           # story page rendering
  /01/[gtin]/            # GS1 Digital Link resolver endpoint
    route.ts
  /api/                  # internal API routes as needed
/lib
  /gs1/                  # Digital Link URI construction, GTIN validation
  /db/                   # Prisma client instance
  /auth/                 # auth helpers
/prisma
  schema.prisma
/components
  /ui/
  /dashboard/
  /story-page/
```

**Why the resolver route is separate from `/api`:** `/01/{gtin}` is a GS1-spec path structure, not an internal API convention — keep it visually and structurally distinct so no one "cleans it up" into `/api/resolve/[gtin]` later and breaks every printed barcode.

---

## 4. Practical setup — repo, access, secrets, baseline tooling

- **Repo:** GitHub, private. Standard PR-based workflow — no direct pushes to `main`. Branch protection with required review is fine to skip at this stage given team size, but keep PRs even for solo work; it creates a clean history and a place for the founder to review before merge.
- **Access/provisioning:** founder creates and owns the GitHub org, Vercel project, Supabase project, and Cloudflare/R2 account; developer gets added with appropriate role access rather than provisioning these independently, since billing and account ownership should stay with the founder.
- **Secrets delivery:** environment variables live in Vercel's dashboard per-environment (dev/staging/prod); local `.env.local` values shared via a password manager (1Password or equivalent), never via chat/email/Slack.
- **Linting/formatting:** ESLint + Prettier, default Next.js config as a starting point — no need to bikeshed this, adjust only if something actively gets in the way.
- **Testing framework:** Vitest. Set up the harness in Phase 0 even though the first real tests (automated barcode decode testing) land in Phase 1 — having the test runner configured and a CI check running (even on zero tests) means Phase 1 just adds test files rather than also wiring up infrastructure.
- **CI:** GitHub Actions running lint + typecheck + test on every PR, deploying preview builds to Vercel automatically (Vercel's GitHub integration handles this natively).

---

## 5. Environment setup

Set up three environments before writing feature code: **dev** (local), **staging** (Vercel preview, shared test data), **prod** (live). Environment variables needed from day one:

```
DATABASE_URL=
DIRECT_URL=                    # for Prisma migrations if using connection pooling
NEXT_PUBLIC_APP_URL=           # marketing site, dashboard — this can change freely, anytime
NEXT_PUBLIC_RESOLVER_URL=      # what gets baked into every Digital Link URI — treat as permanent
AUTH_SECRET / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY  # Supabase Auth
STORAGE_BUCKET / STORAGE_KEYS  # Cloudflare R2 credentials (zero egress fees — see architecture doc)
```

**Domain status: not yet registered.** `Almsby.io` has not been purchased as of Phase 0 start. This does not block development — set both `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_RESOLVER_URL` to Vercel's auto-generated preview domain (e.g. `Almsby.vercel.app`) for now. No barcode gets printed during Phase 0, so there's no cost to building against a placeholder. Swapping in a real domain later is a one-line env change, provided the `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_RESOLVER_URL` split below is respected from the start.

**Founder action item, separate from dev work:** register `Almsby.io` and any short-domain resolver candidates (e.g. `gdstry.co`) soon — cheap, defensive, and removes "someone else grabbed it" as a risk. The final decision on which domain the resolver actually uses doesn't need to be made until the first real barcode print run, but the domains themselves should be secured well before then.

**Critical discipline, non-negotiable:** `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_RESOLVER_URL` are two separate env variables even though they may point to the same value today. Every place in the codebase that constructs a GS1 Digital Link URI must read `NEXT_PUBLIC_RESOLVER_URL` — never `NEXT_PUBLIC_APP_URL`, and never a hardcoded domain string. This is what keeps the resolver domain decision (short standalone domain vs. subdomain vs. main domain) open and cheap to change right up until the first real barcode gets printed. Once that discipline is in place, switching the resolver domain later is a one-line env change and a redeploy — mixing the two variables anywhere means a future domain change requires rewriting every already-generated Digital Link URI instead.

**Do this now, not later:** confirm `NEXT_PUBLIC_RESOLVER_URL` is correct per environment before any barcode is ever generated, even in testing — a Digital Link URI baked with the wrong domain in a demo is a minor annoyance; the same mistake in a customer-facing generation flow later is a much bigger problem to unwind.

---

## 6. Initial database schema (Phase 0 scope only)

Phase 0 needs the schema in place and migrated, but only `Business`, `User`/auth linkage, and an empty `Product` model need to actually work end-to-end. `GTIN`, `Barcode`, `StoryPage`, and `ComplianceStatus` tables should exist in the schema (so migrations aren't repeatedly reshuffled later) but their logic is Phase 1+.

```prisma
model Business {
  id            String   @id @default(cuid())
  name          String
  gs1Prefix     String?
  membershipStatus String @default("none") // none | in_progress | active
  subscriptionTier String @default("starter")
  createdAt     DateTime @default(now())
  products      Product[]
}

model Product {
  id            String   @id @default(cuid())
  businessId    String
  business      Business @relation(fields: [businessId], references: [id])
  name          String
  brand         String?
  status        String   @default("draft") // draft | active | archived
  createdAt     DateTime @default(now())
}

// GTIN, Barcode, StoryPage, ComplianceStatus models scaffolded per architecture doc,
// left minimal/unused until Phase 1
```

---

## 7. Definition of done for Phase 0

Don't mark this phase complete from "it works on my machine." The bar is:

- [ ] A new user can sign up, log in, and create a Business record — **in the deployed staging environment**, not just locally
- [ ] An empty Product record can be created under that Business
- [ ] All three route groups (`(dashboard)`, `(public)`, `/01/[gtin]`) exist and render *something*, even placeholder content — confirming the routing split works before real features get built into it
- [ ] `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_RESOLVER_URL` are all confirmed correct and distinct across dev/staging/prod
- [ ] Confirmed: no code path constructs a Digital Link URI using `NEXT_PUBLIC_APP_URL` or a hardcoded domain string — only `NEXT_PUBLIC_RESOLVER_URL`
- [ ] Prisma migrations run cleanly from a fresh database (test this — a migration that only works on someone's already-set-up local DB is a hidden landmine)

---

## 8. Explicit guardrails — what NOT to build in Phase 0

Hand this list to whoever's building it, verbatim, so scope doesn't quietly creep:
- No GTIN/barcode logic yet — those tables exist in the schema but stay empty
- No story page content rendering — the route exists, the CMS doesn't yet
- No billing/Stripe integration
- No custom domain support for the resolver — hardcode to the single app domain for now, per the architecture doc's phased approach

If a developer finds themselves building any of the above "while they're in there," that's the signal to stop and check in — Phase 0 done well is boring by design.
