-- CreateEnum
CREATE TYPE "EventSubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubmissionImageSource" AS ENUM ('UPLOADED', 'EXTERNAL_URL');

-- CreateTable
CREATE TABLE "EventSubmission" (
    "id" TEXT NOT NULL,
    "status" "EventSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactMethod" TEXT NOT NULL,
    "instagram" TEXT,
    "whatsapp" TEXT,
    "submittedLocale" "LocaleCode" NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "approvedEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSubmissionImage" (
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

    CONSTRAINT "EventSubmissionImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventSubmission" ADD CONSTRAINT "EventSubmission_approvedEventId_fkey" FOREIGN KEY ("approvedEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSubmissionImage" ADD CONSTRAINT "EventSubmissionImage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "EventSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
