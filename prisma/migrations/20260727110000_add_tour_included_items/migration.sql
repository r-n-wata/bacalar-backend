ALTER TABLE "TourSubmission"
  ADD COLUMN "includedItems" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "TourTranslation"
  ADD COLUMN "includedItems" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
