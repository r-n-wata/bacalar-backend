CREATE TABLE "AdminAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "supabaseUserId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminAccount_email_key" ON "AdminAccount"("email");

CREATE UNIQUE INDEX "AdminAccount_supabaseUserId_key" ON "AdminAccount"("supabaseUserId");

ALTER TABLE "RestaurantSubmission"
ADD CONSTRAINT "RestaurantSubmission_approvedRestaurantId_fkey"
FOREIGN KEY ("approvedRestaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
