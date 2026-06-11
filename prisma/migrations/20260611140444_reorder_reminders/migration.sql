-- CreateTable
CREATE TABLE "ReorderReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL DEFAULT '',
    "productTitle" TEXT NOT NULL DEFAULT '',
    "frequencyWeeks" INTEGER NOT NULL DEFAULT 4,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastRemindedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ReorderReminder_email_productSlug_key" ON "ReorderReminder"("email", "productSlug");
