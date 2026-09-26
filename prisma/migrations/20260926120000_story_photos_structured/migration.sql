-- StoryPage.photos: TEXT[] of bare R2 URLs -> JSONB array of structured photos
--   { "url": "...", "role": "materials" | "process" | "details" | "makers" | "in_use", "caption": "..." }
--
-- Why: a bare URL cannot say what a photo IS. The story page needs to tell a
-- shopper "this is the raw fibre" vs "this is the workshop" vs "this is the
-- finished piece being worn", which is what the concept design's roles express.
--
-- Legacy data is preserved, not reinterpreted: each existing URL becomes
-- { "url": <url> } with NO role and NO caption. lib/story/photos.ts
-- (normalizeStoryPhotos) reads that shape and the gallery renders no badge for
-- it — inventing a role for a photo whose subject we do not know would be a
-- false claim on a consumer-facing page.
--
-- DEPLOY ORDER: apply together with the app code that reads objects. The
-- previous app version expects bare strings, so it will not render these rows
-- correctly (it would put an object into <img src>) though it will not crash.
-- Adding a temporary compatibility view was considered and rejected: StoryPage
-- has no production data yet, so an add/copy/drop/rename is simpler to reason
-- about than a compatibility shim with a later removal step.

-- 1. Add the new column alongside the old one (no data loss if anything fails).
ALTER TABLE "StoryPage" ADD COLUMN "photos_json" JSONB;

-- 2. Copy: each URL becomes an object carrying only the URL.
UPDATE "StoryPage"
SET "photos_json" = COALESCE(
  (
    SELECT jsonb_agg(jsonb_build_object('url', entry.photo) ORDER BY entry.ord)
    FROM unnest("photos") WITH ORDINALITY AS entry(photo, ord)
  ),
  '[]'::jsonb
);

-- 3. Rows that were NULL (or had no array at all) become an empty array.
UPDATE "StoryPage" SET "photos_json" = '[]'::jsonb WHERE "photos_json" IS NULL;

-- 4. Swap the columns over.
ALTER TABLE "StoryPage" DROP COLUMN "photos";
ALTER TABLE "StoryPage" RENAME COLUMN "photos_json" TO "photos";

-- 5. Match the Prisma model: non-null with an empty-array default, so callers
--    never have to branch on null vs empty.
ALTER TABLE "StoryPage" ALTER COLUMN "photos" SET DEFAULT '[]'::jsonb;
ALTER TABLE "StoryPage" ALTER COLUMN "photos" SET NOT NULL;
