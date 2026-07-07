ALTER TABLE "Tour"
  RENAME COLUMN "durationLabel" TO "duration";

ALTER TABLE "Tour"
  RENAME COLUMN "groupType" TO "privateOrShared";

ALTER TABLE "Tour"
  RENAME COLUMN "kidFriendly" TO "suitableForKids";

ALTER TABLE "Tour"
  RENAME COLUMN "instagram" TO "operatorInstagram";

ALTER TABLE "Tour"
  RENAME COLUMN "whatsapp" TO "operatorWhatsapp";

ALTER TABLE "Tour"
  RENAME COLUMN "website" TO "operatorWebsite";

ALTER TABLE "Tour"
  ADD COLUMN "operatorPrimaryContactMethod" TEXT,
  ADD COLUMN "meetingPoint" TEXT,
  ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "TourTranslation"
  ADD COLUMN "included" TEXT,
  ADD COLUMN "whatToBring" TEXT,
  ADD COLUMN "operatorDescription" TEXT;

UPDATE "Tour"
SET "operatorName" = COALESCE(NULLIF(TRIM("operatorName"), ''), 'Local operator');

ALTER TABLE "Tour"
  ALTER COLUMN "operatorName" SET NOT NULL;

ALTER TABLE "Tour"
  RENAME COLUMN "priceLabel" TO "priceFrom";
