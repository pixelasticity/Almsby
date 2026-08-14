-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "name" TEXT NOT NULL,
    "gs1Prefix" TEXT,
    "membershipStatus" TEXT NOT NULL DEFAULT 'none',
    "subscriptionTier" TEXT NOT NULL DEFAULT 'starter',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GTIN" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "gtinValue" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'own_prefix',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GTIN_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barcode" (
    "id" TEXT NOT NULL,
    "gtinId" TEXT NOT NULL,
    "digitalLinkUri" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'qr',
    "legacyBarcodeValue" TEXT,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "assetUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Barcode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryPage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "headline" TEXT,
    "bodyContent" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceStatus" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sunrise2027Ready" BOOLEAN NOT NULL DEFAULT false,
    "dppFieldsComplete" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GTIN_productId_key" ON "GTIN"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Barcode_gtinId_key" ON "Barcode"("gtinId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryPage_productId_key" ON "StoryPage"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceStatus_productId_key" ON "ComplianceStatus"("productId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GTIN" ADD CONSTRAINT "GTIN_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Barcode" ADD CONSTRAINT "Barcode_gtinId_fkey" FOREIGN KEY ("gtinId") REFERENCES "GTIN"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryPage" ADD CONSTRAINT "StoryPage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceStatus" ADD CONSTRAINT "ComplianceStatus_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
