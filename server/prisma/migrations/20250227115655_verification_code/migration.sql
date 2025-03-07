-- CreateEnum
CREATE TYPE "VerificationCodeType" AS ENUM ('EMAIL_VERIFICATION', 'RESET_PASSWORD');

-- CreateTable
CREATE TABLE "verification-codes" (
    "id" TEXT NOT NULL,
    "type" "VerificationCodeType" NOT NULL,
    "userId" TEXT NOT NULL,
    "expires-at" TIMESTAMP(3) NOT NULL,
    "created-at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated-at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification-codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification-codes_userId_idx" ON "verification-codes"("userId");

-- AddForeignKey
ALTER TABLE "verification-codes" ADD CONSTRAINT "verification-codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
