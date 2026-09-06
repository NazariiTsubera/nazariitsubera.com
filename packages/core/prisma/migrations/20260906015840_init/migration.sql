-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('captured', 'generating', 'preview_live', 'expired', 'won', 'lost', 'churned');

-- CreateEnum
CREATE TYPE "VendorTier" AS ENUM ('none', 'free', 'storefront');

-- CreateEnum
CREATE TYPE "AuthoredBy" AS ENUM ('model', 'template');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('vendor_created', 'preview_published', 'preview_opened', 'preview_extended', 'preview_expired', 'unpublished', 'marked_won', 'marked_lost');

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT NOT NULL,
    "instagramHandle" TEXT,
    "slug" TEXT NOT NULL,
    "status" "VendorStatus" NOT NULL DEFAULT 'captured',
    "tier" "VendorTier" NOT NULL DEFAULT 'none',
    "photoConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentText" TEXT,
    "consentAt" TIMESTAMP(3),
    "previewToken" TEXT NOT NULL,
    "previewExpiresAt" TIMESTAMP(3),
    "previewOpenedAt" TIMESTAMP(3),
    "publishedVersionId" TEXT,
    "themeOverride" TEXT,
    "designNotes" TEXT,
    "customDomain" TEXT,
    "showInPortfolio" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteVersion" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "contentJson" JSONB NOT NULL,
    "authoredBy" "AuthoredBy" NOT NULL,
    "themeId" TEXT,
    "html" TEXT NOT NULL,
    "renderFlags" JSONB NOT NULL,
    "gateReport" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT,
    "type" "EventType" NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_slug_key" ON "Vendor"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_previewToken_key" ON "Vendor"("previewToken");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_publishedVersionId_key" ON "Vendor"("publishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_customDomain_key" ON "Vendor"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "SiteVersion_vendorId_version_key" ON "SiteVersion"("vendorId", "version");

-- CreateIndex
CREATE INDEX "Event_vendorId_createdAt_idx" ON "Event"("vendorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "SiteVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteVersion" ADD CONSTRAINT "SiteVersion_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
