-- AlterTable
ALTER TABLE "Event"
ADD COLUMN "address" TEXT,
ADD COLUMN "mapUrl" TEXT,
ADD COLUMN "mapEmbedUrl" TEXT;

-- AlterTable
ALTER TABLE "EventSubmission"
ADD COLUMN "address" TEXT,
ADD COLUMN "mapUrl" TEXT,
ADD COLUMN "mapEmbedUrl" TEXT;

-- AlterTable
ALTER TABLE "Restaurant"
ADD COLUMN "address" TEXT,
ADD COLUMN "mapUrl" TEXT,
ADD COLUMN "mapEmbedUrl" TEXT;

-- AlterTable
ALTER TABLE "RestaurantSubmission"
ADD COLUMN "address" TEXT,
ADD COLUMN "mapUrl" TEXT,
ADD COLUMN "mapEmbedUrl" TEXT;

-- AlterTable
ALTER TABLE "Tour"
ADD COLUMN "address" TEXT,
ADD COLUMN "mapUrl" TEXT,
ADD COLUMN "mapEmbedUrl" TEXT;

-- AlterTable
ALTER TABLE "TourSubmission"
ADD COLUMN "address" TEXT,
ADD COLUMN "mapUrl" TEXT,
ADD COLUMN "mapEmbedUrl" TEXT;
