-- CreateTable
CREATE TABLE "ShippingRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "minGrams" INTEGER NOT NULL DEFAULT 0,
    "maxGrams" INTEGER,
    "rate" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "emoji" TEXT NOT NULL DEFAULT '🌿',
    "gradient" TEXT NOT NULL DEFAULT 'gradient-purple',
    "badges" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "images" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL,
    "compareAtPrice" INTEGER,
    "vendor" TEXT NOT NULL DEFAULT 'Eco Global Foods',
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isBestseller" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "seoKeywords" TEXT NOT NULL DEFAULT '',
    "collectionId" TEXT,
    "isBundle" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("badges", "collectionId", "compareAtPrice", "createdAt", "description", "emoji", "gradient", "id", "imageUrl", "images", "isBestseller", "isBundle", "isNew", "price", "rating", "reviewCount", "seoDescription", "seoKeywords", "seoTitle", "slug", "status", "tagline", "title", "updatedAt", "vendor") SELECT "badges", "collectionId", "compareAtPrice", "createdAt", "description", "emoji", "gradient", "id", "imageUrl", "images", "isBestseller", "isBundle", "isNew", "price", "rating", "reviewCount", "seoDescription", "seoKeywords", "seoTitle", "slug", "status", "tagline", "title", "updatedAt", "vendor" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
