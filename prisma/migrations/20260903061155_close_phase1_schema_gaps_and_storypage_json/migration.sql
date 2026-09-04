/*
  Close Phase 1 schema gaps + Phase 2 StoryPage.bodyContent type change.

  The five Product fields (category, recyclable, recyclingInstructions,
  sourcingNotes, takebackProgram) were specified in the Phase 1 brief and the
  architecture doc but never migrated. All are nullable with no defaults and no
  backfill — existing Product rows get NULL, matching the add_product_core_fields
  pattern. StoryPage.count was confirmed 0 before running, so the bodyContent
  drop+recreate loses no data; scaffolded-only table.

  Warnings:
  - The `bodyContent` column on the `StoryPage` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT,
ADD COLUMN     "recyclable" BOOLEAN,
ADD COLUMN     "recyclingInstructions" TEXT,
ADD COLUMN     "sourcingNotes" TEXT,
ADD COLUMN     "takebackProgram" TEXT;

-- AlterTable
ALTER TABLE "StoryPage" DROP COLUMN "bodyContent",
ADD COLUMN     "bodyContent" JSONB;
