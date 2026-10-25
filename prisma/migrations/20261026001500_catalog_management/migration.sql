-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('LIVE', 'DRAFT', 'HIDDEN');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "SupportThread" ADD COLUMN     "staffUnread" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_status_categoryId_idx" ON "Product"("status", "categoryId");


-- Preserve visibility of the existing storefront catalog.
UPDATE "Product" SET "status" = 'LIVE';
UPDATE "Product" SET "featured" = true
WHERE "id" IN (SELECT "id" FROM "Product" ORDER BY "createdAt" DESC LIMIT 8);
