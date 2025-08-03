-- Add sessionKeyPublic field to SessionKey table
ALTER TABLE "public"."SessionKey" ADD COLUMN "sessionKeyPublic" TEXT;

-- Update existing SessionKey records to have a default value (empty string for now)
-- You may want to populate this field with actual session key addresses later
UPDATE "public"."SessionKey" SET "sessionKeyPublic" = '' WHERE "sessionKeyPublic" IS NULL;

-- Make the field NOT NULL after updating existing records
ALTER TABLE "public"."SessionKey" ALTER COLUMN "sessionKeyPublic" SET NOT NULL;