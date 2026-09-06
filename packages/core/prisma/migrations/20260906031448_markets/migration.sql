-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'capture_uploaded';
ALTER TYPE "EventType" ADD VALUE 'asset_uploaded';
ALTER TYPE "EventType" ADD VALUE 'generation_started';
ALTER TYPE "EventType" ADD VALUE 'generation_succeeded';
ALTER TYPE "EventType" ADD VALUE 'generation_failed';
ALTER TYPE "EventType" ADD VALUE 'sms_link_tapped';

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "bestSellerNote" TEXT,
ADD COLUMN     "marketId" TEXT;

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "mapsUrl" TEXT,
    "scheduleNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Market_slug_key" ON "Market"("slug");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;
