/*
  Warnings:

  - The required column `unsubToken` was added to the `NewsletterSubscriber` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL DEFAULT '',
    "ctaUrl" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NewsletterSubscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'footer',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "unsubToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_NewsletterSubscriber" ("active", "createdAt", "email", "id", "source") SELECT "active", "createdAt", "email", "id", "source" FROM "NewsletterSubscriber";
DROP TABLE "NewsletterSubscriber";
ALTER TABLE "new_NewsletterSubscriber" RENAME TO "NewsletterSubscriber";
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
