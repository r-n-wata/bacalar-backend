ALTER TABLE "Tour"
  ALTER COLUMN "category" TYPE TEXT USING "category"::text;

ALTER TABLE "TourSubmission"
  ALTER COLUMN "category" TYPE TEXT USING "category"::text;

ALTER TABLE "Tour"
  ADD COLUMN "durationLabel" TEXT,
  ADD COLUMN "priceLabel" TEXT,
  ADD COLUMN "groupType" TEXT,
  ADD COLUMN "bestFor" TEXT,
  ADD COLUMN "difficulty" TEXT,
  ADD COLUMN "kidFriendly" TEXT,
  ADD COLUMN "operatorName" TEXT,
  ADD COLUMN "instagram" TEXT,
  ADD COLUMN "whatsapp" TEXT,
  ADD COLUMN "website" TEXT;

UPDATE "Tour"
SET
  "durationLabel" = "durationHours"::text || ' hours',
  "priceLabel" = 'From ' || "priceFrom"::text || ' MXN',
  "groupType" = 'Shared',
  "bestFor" = 'Flexible',
  "difficulty" = 'Easy',
  "kidFriendly" = 'Yes';

ALTER TABLE "Tour"
  ALTER COLUMN "durationLabel" SET NOT NULL,
  ALTER COLUMN "priceLabel" SET NOT NULL,
  ALTER COLUMN "groupType" SET NOT NULL,
  ALTER COLUMN "bestFor" SET NOT NULL,
  ALTER COLUMN "difficulty" SET NOT NULL,
  ALTER COLUMN "kidFriendly" SET NOT NULL;

ALTER TABLE "Tour" DROP COLUMN "durationHours";
ALTER TABLE "Tour" DROP COLUMN "priceFrom";

ALTER TABLE "TourTranslation" DROP COLUMN "category";

DROP TYPE "TourCategory";
