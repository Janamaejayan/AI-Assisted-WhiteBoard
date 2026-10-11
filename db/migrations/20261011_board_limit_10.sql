ALTER TABLE "users" ALTER COLUMN "credits" SET DEFAULT 10;

-- Existing accounts created with the previous default should receive the new limit.
UPDATE "users" SET "credits" = 10 WHERE "credits" = 3 OR "credits" IS NULL;

ALTER TABLE "users" ALTER COLUMN "credits" SET NOT NULL;
