-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "Customer" ADD COLUMN "resetTokenExpiry" DATETIME;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "line" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AbandonedCheckout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "subtotal" INTEGER NOT NULL DEFAULT 0,
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" INTEGER NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "subtotal" INTEGER NOT NULL,
    "shipping" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "discountCode" TEXT NOT NULL DEFAULT '',
    "total" INTEGER NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT NOT NULL DEFAULT 'cod',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "fulfillmentStatus" TEXT NOT NULL DEFAULT 'unfulfilled',
    "courier" TEXT NOT NULL DEFAULT '',
    "trackingNumber" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("address", "city", "courier", "createdAt", "customerId", "customerName", "discount", "discountCode", "email", "fulfillmentStatus", "id", "note", "orderNumber", "paymentMethod", "paymentStatus", "phone", "shipping", "subtotal", "total", "trackingNumber", "updatedAt") SELECT "address", "city", "courier", "createdAt", "customerId", "customerName", "discount", "discountCode", "email", "fulfillmentStatus", "id", "note", "orderNumber", "paymentMethod", "paymentStatus", "phone", "shipping", "subtotal", "total", "trackingNumber", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
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
INSERT INTO "new_Product" ("badges", "collectionId", "compareAtPrice", "createdAt", "description", "emoji", "gradient", "id", "imageUrl", "images", "isBestseller", "isNew", "price", "rating", "reviewCount", "seoDescription", "seoKeywords", "seoTitle", "slug", "status", "tagline", "title", "updatedAt", "vendor") SELECT "badges", "collectionId", "compareAtPrice", "createdAt", "description", "emoji", "gradient", "id", "imageUrl", "images", "isBestseller", "isNew", "price", "rating", "reviewCount", "seoDescription", "seoKeywords", "seoTitle", "slug", "status", "tagline", "title", "updatedAt", "vendor" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AbandonedCheckout_email_key" ON "AbandonedCheckout"("email");
