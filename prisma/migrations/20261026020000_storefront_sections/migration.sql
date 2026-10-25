-- CreateTable
CREATE TABLE "StorefrontSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorefrontSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontSectionProduct" (
    "sectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StorefrontSectionProduct_pkey" PRIMARY KEY ("sectionId","productId")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontSection_name_key" ON "StorefrontSection"("name");

-- CreateIndex
CREATE INDEX "StorefrontSection_sortOrder_idx" ON "StorefrontSection"("sortOrder");

-- CreateIndex
CREATE INDEX "StorefrontSectionProduct_productId_idx" ON "StorefrontSectionProduct"("productId");

-- CreateIndex
CREATE INDEX "StorefrontSectionProduct_sectionId_sortOrder_idx" ON "StorefrontSectionProduct"("sectionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "StorefrontSectionProduct" ADD CONSTRAINT "StorefrontSectionProduct_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "StorefrontSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontSectionProduct" ADD CONSTRAINT "StorefrontSectionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Default sections are initialized once, and are editable/deletable thereafter.
INSERT INTO "StorefrontSection" ("id", "name", "sortOrder", "updatedAt") VALUES
  ('default-editors-picks', 'Editor''s Picks', 0, CURRENT_TIMESTAMP),
  ('default-new-arrival', 'New Arrival', 1, CURRENT_TIMESTAMP),
  ('default-onsale', 'Onsale', 2, CURRENT_TIMESTAMP);

INSERT INTO "StorefrontSectionProduct" ("sectionId", "productId", "sortOrder")
SELECT 'default-editors-picks', "id", (ROW_NUMBER() OVER (ORDER BY "createdAt" DESC, "id") - 1)::integer
FROM (SELECT "id", "createdAt" FROM "Product" WHERE "status" = 'LIVE' AND "featured" = true ORDER BY "createdAt" DESC, "id" LIMIT 8) AS selected;

INSERT INTO "StorefrontSectionProduct" ("sectionId", "productId", "sortOrder")
SELECT 'default-new-arrival', "id", (ROW_NUMBER() OVER (ORDER BY "createdAt" DESC, "id") - 1)::integer
FROM (SELECT "id", "createdAt" FROM "Product" WHERE "status" = 'LIVE' ORDER BY "createdAt" DESC, "id" LIMIT 8) AS selected;

INSERT INTO "StorefrontSectionProduct" ("sectionId", "productId", "sortOrder")
SELECT 'default-onsale', "id", (ROW_NUMBER() OVER (ORDER BY "createdAt" DESC, "id") - 1)::integer
FROM (SELECT "id", "createdAt" FROM "Product" WHERE "status" = 'LIVE' AND "discountedPrice" < "originalPrice" ORDER BY "createdAt" DESC, "id" LIMIT 8) AS selected;
