-- Add missing fields to SwapRule table
ALTER TABLE "public"."SwapRule" ADD COLUMN "fromChain" TEXT;
ALTER TABLE "public"."SwapRule" ADD COLUMN "toChain" TEXT;
ALTER TABLE "public"."SwapRule" ADD COLUMN "fromTokenAddress" TEXT;
ALTER TABLE "public"."SwapRule" ADD COLUMN "toTokenAddress" TEXT;
ALTER TABLE "public"."SwapRule" ADD COLUMN "estimatedValue" DOUBLE PRECISION;
ALTER TABLE "public"."SwapRule" ADD COLUMN "bridgeProtocol" TEXT;
ALTER TABLE "public"."SwapRule" ADD COLUMN "maxSlippage" DOUBLE PRECISION;
ALTER TABLE "public"."SwapRule" ADD COLUMN "estimatedFees" DOUBLE PRECISION;

-- Update existing SwapRule records to have default values for required fields
UPDATE "public"."SwapRule" SET "fromChain" = 'Base Sepolia' WHERE "fromChain" IS NULL;
UPDATE "public"."SwapRule" SET "toChain" = 'Base Sepolia' WHERE "toChain" IS NULL;

-- Make the required fields NOT NULL after updating existing records
ALTER TABLE "public"."SwapRule" ALTER COLUMN "fromChain" SET NOT NULL;
ALTER TABLE "public"."SwapRule" ALTER COLUMN "toChain" SET NOT NULL;