CREATE TYPE "RestaurantMoment" AS ENUM ('breakfast', 'lunch', 'dinner');

ALTER TABLE "Restaurant"
ADD COLUMN "moments" "RestaurantMoment"[];

UPDATE "Restaurant"
SET "moments" = ARRAY["moment"::"RestaurantMoment"];

ALTER TABLE "Restaurant"
ALTER COLUMN "moments" SET NOT NULL;

ALTER TABLE "Restaurant"
DROP COLUMN "moment";
