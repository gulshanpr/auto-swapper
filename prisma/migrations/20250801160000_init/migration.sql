-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SessionKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delegator" TEXT NOT NULL,
    "keyEncrypted" TEXT NOT NULL,
    "validUntil" INTEGER NOT NULL,
    "actions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SwapRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionKeyId" TEXT NOT NULL,
    "fromToken" TEXT NOT NULL,
    "toToken" TEXT NOT NULL,
    "percent" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "frequency" TEXT NOT NULL,
    "nextExecution" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SwapRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SwapLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "txHash" TEXT,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "SwapLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "public"."User"("wallet");

-- AddForeignKey
ALTER TABLE "public"."SessionKey" ADD CONSTRAINT "SessionKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SwapRule" ADD CONSTRAINT "SwapRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SwapRule" ADD CONSTRAINT "SwapRule_sessionKeyId_fkey" FOREIGN KEY ("sessionKeyId") REFERENCES "public"."SessionKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SwapLog" ADD CONSTRAINT "SwapLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SwapLog" ADD CONSTRAINT "SwapLog_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."SwapRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
