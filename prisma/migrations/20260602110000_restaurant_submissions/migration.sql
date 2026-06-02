-- CreateEnum
CREATE TYPE "RestaurantSubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "RestaurantSubmission" (
    "id" TEXT NOT NULL,
    "status" "RestaurantSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "moment" TEXT NOT NULL,
    "priceBand" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactMethod" TEXT NOT NULL,
    "instagram" TEXT,
    "whatsapp" TEXT,
    "submittedLocale" "LocaleCode" NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "approvedRestaurantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantSubmissionImage" (
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

    CONSTRAINT "RestaurantSubmissionImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RestaurantSubmissionImage" ADD CONSTRAINT "RestaurantSubmissionImage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "RestaurantSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
