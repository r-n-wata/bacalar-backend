CREATE TYPE "TourCategory" AS ENUM ('premium', 'group', 'adventure');

CREATE TYPE "TourSubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Tour"
ADD COLUMN "category" "TourCategory",
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "featuredOrder" INTEGER;

UPDATE "Tour"
SET "category" = CASE
  WHEN "slug" = 'tour-sailing' THEN 'premium'::"TourCategory"
  WHEN "slug" = 'tour-pontoon' THEN 'group'::"TourCategory"
  WHEN "slug" = 'tour-kayak' THEN 'adventure'::"TourCategory"
  ELSE 'adventure'::"TourCategory"
END;

UPDATE "Tour"
SET
  "isFeatured" = CASE
    WHEN "slug" IN ('tour-sailing', 'tour-pontoon', 'tour-kayak') THEN true
    ELSE false
  END,
  "featuredOrder" = CASE
    WHEN "slug" = 'tour-sailing' THEN 0
    WHEN "slug" = 'tour-pontoon' THEN 1
    WHEN "slug" = 'tour-kayak' THEN 2
    ELSE NULL
  END;

ALTER TABLE "Tour"
ALTER COLUMN "category" SET NOT NULL;

CREATE TABLE "TourSubmission" (
    "id" TEXT NOT NULL,
    "status" "TourSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "category" "TourCategory" NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "priceFrom" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactMethod" TEXT NOT NULL,
    "instagram" TEXT,
    "whatsapp" TEXT,
    "submittedLocale" "LocaleCode" NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "approvedTourId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TourSubmissionImage" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "source" "SubmissionImageSource" NOT NULL,
    "url" TEXT NOT NULL,
    "objectKey" TEXT,
    "mimeType" TEXT,
    "originalFilename" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourSubmissionImage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "TourSubmission" ADD CONSTRAINT "TourSubmission_approvedTourId_fkey" FOREIGN KEY ("approvedTourId") REFERENCES "Tour"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TourSubmissionImage" ADD CONSTRAINT "TourSubmissionImage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "TourSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
