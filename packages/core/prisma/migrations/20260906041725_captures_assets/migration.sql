-- CreateEnum
CREATE TYPE "TranscriptStatus" AS ENUM ('none', 'pending', 'done', 'failed');

-- CreateEnum
CREATE TYPE "AssetKind" AS ENUM ('product', 'scene', 'person');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('uploaded', 'processed', 'failed');

-- CreateTable
CREATE TABLE "Capture" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "audioKey" TEXT NOT NULL,
    "audioMime" TEXT NOT NULL,
    "audioBytes" INTEGER NOT NULL,
    "audioSha256" TEXT NOT NULL,
    "durationSec" INTEGER,
    "transcript" TEXT,
    "transcriptStatus" "TranscriptStatus" NOT NULL DEFAULT 'none',
    "operatorPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Capture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "originalKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "kind" "AssetKind" NOT NULL DEFAULT 'product',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "alt" TEXT,
    "cutoutKey" TEXT,
    "derived" JSONB,
    "status" "AssetStatus" NOT NULL DEFAULT 'uploaded',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Capture_vendorId_audioSha256_key" ON "Capture"("vendorId", "audioSha256");

-- CreateIndex
CREATE INDEX "Asset_vendorId_orderIndex_idx" ON "Asset"("vendorId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_vendorId_sha256_key" ON "Asset"("vendorId", "sha256");

-- AddForeignKey
ALTER TABLE "Capture" ADD CONSTRAINT "Capture_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
