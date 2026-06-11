-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "coverEmoji" TEXT NOT NULL DEFAULT '🌿',
    "gradient" TEXT NOT NULL DEFAULT 'gradient-purple',
    "author" TEXT NOT NULL DEFAULT 'Eco Global Foods',
    "category" TEXT NOT NULL DEFAULT 'Wellness',
    "status" TEXT NOT NULL DEFAULT 'published',
    "readMinutes" INTEGER NOT NULL DEFAULT 4,
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "seoKeywords" TEXT NOT NULL DEFAULT '',
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'percentage',
    "value" INTEGER NOT NULL DEFAULT 0,
    "minSubtotal" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
INSERT INTO "new_Order" ("address", "city", "courier", "createdAt", "customerId", "customerName", "email", "fulfillmentStatus", "id", "note", "orderNumber", "paymentMethod", "paymentStatus", "phone", "shipping", "subtotal", "total", "trackingNumber", "updatedAt") SELECT "address", "city", "courier", "createdAt", "customerId", "customerName", "email", "fulfillmentStatus", "id", "note", "orderNumber", "paymentMethod", "paymentStatus", "phone", "shipping", "subtotal", "total", "trackingNumber", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_code_key" ON "Discount"("code");
